create extension if not exists pgcrypto;

create schema if not exists private;

revoke all on schema private from public;

create type public.app_role as enum ('coordinator', 'nutritionist');

create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  role public.app_role not null,
  primary_unit_id uuid not null references public.units(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.unit_access_grants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  granted_by uuid not null references public.profiles(id) on delete restrict,
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null check (valid_until > valid_from),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete restrict,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create unique index one_active_grant_per_profile_unit
  on public.unit_access_grants(profile_id, unit_id)
  where revoked_at is null;

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  check (
    not jsonb_path_exists(
      metadata,
      'lax $.** ? (@.type() == "object").keyvalue() ? (@.key like_regex "^(clinical_text|notes|anamnesis)$" flag "i")'
    )
  )
);

create function private.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select profile
  from public.profiles as profile
  where profile.id = auth.uid()
    and profile.active
$$;

revoke all on function private.current_profile() from public, anon, authenticated;

create function private.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.active
      and profile.role = 'coordinator'::public.app_role
  )
$$;

revoke all on function private.is_coordinator() from public, anon, authenticated;

create function private.can_access_unit(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    join public.units as target_unit
      on target_unit.id = target_unit_id
     and target_unit.active
    where profile.id = auth.uid()
      and profile.active
      and (
        profile.role = 'coordinator'::public.app_role
        or profile.primary_unit_id = target_unit_id
        or exists (
          select 1
          from public.unit_access_grants as access_grant
          where access_grant.profile_id = profile.id
            and access_grant.unit_id = target_unit_id
            and access_grant.revoked_at is null
            and access_grant.valid_from <= now()
            and now() < access_grant.valid_until
        )
      )
  )
$$;

revoke all on function private.can_access_unit(uuid)
  from public, anon, authenticated;

alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.unit_access_grants enable row level security;
alter table public.audit_events enable row level security;

create policy "active profiles can read their own profile"
on public.profiles
for select
to authenticated
using (
  active
  and (
    id = (select auth.uid())
    or (select private.is_coordinator())
  )
);

create policy "coordinators can read active units"
on public.units
for select
to authenticated
using (
  active
  and (select private.is_coordinator())
);

create policy "profiles can read permitted access grants"
on public.unit_access_grants
for select
to authenticated
using (
  (select private.is_coordinator())
  or (
    profile_id = (select auth.uid())
    and revoked_at is null
    and valid_from <= now()
    and now() < valid_until
  )
);

create function public.grant_unit_access(
  target_profile_id uuid,
  target_unit_id uuid,
  reason text,
  valid_until timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_primary_unit_id uuid;
  normalized_reason text := trim(reason);
  created_grant_id uuid;
begin
  if not private.is_coordinator() then
    raise exception using
      errcode = '42501',
      message = 'Only active coordinators can grant unit access';
  end if;

  select profile.primary_unit_id
  into target_primary_unit_id
  from public.profiles as profile
  where profile.id = target_profile_id
    and profile.active;

  if target_primary_unit_id is null then
    raise exception using
      errcode = '22023',
      message = 'Target profile must be active';
  end if;

  if not exists (
    select 1
    from public.units as target_unit
    where target_unit.id = target_unit_id
      and target_unit.active
  ) then
    raise exception using
      errcode = '22023',
      message = 'Target unit must be active';
  end if;

  if target_primary_unit_id = target_unit_id then
    raise exception using
      errcode = '22023',
      message = 'Target unit must differ from the primary unit';
  end if;

  if char_length(normalized_reason) not between 5 and 500 then
    raise exception using
      errcode = '22023',
      message = 'Grant reason must contain between 5 and 500 characters';
  end if;

  if valid_until <= now() then
    raise exception using
      errcode = '22023',
      message = 'Grant expiration must be in the future';
  end if;

  update public.unit_access_grants as expired_grant
  set
    revoked_at = now(),
    revoked_by = actor_id,
    revocation_reason = 'Expired grant superseded'
  where expired_grant.profile_id = target_profile_id
    and expired_grant.unit_id = target_unit_id
    and expired_grant.revoked_at is null
    and expired_grant.valid_until <= now();

  insert into public.unit_access_grants (
    profile_id,
    unit_id,
    reason,
    granted_by,
    valid_until
  )
  values (
    target_profile_id,
    target_unit_id,
    normalized_reason,
    actor_id,
    valid_until
  )
  returning id into created_grant_id;

  insert into public.audit_events (
    actor_id,
    unit_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    actor_id,
    target_unit_id,
    'unit_access_granted',
    'unit_access_grant',
    created_grant_id::text,
    jsonb_build_object(
      'profile_id', target_profile_id,
      'valid_until', valid_until
    )
  );

  return created_grant_id;
end;
$$;

revoke all on function public.grant_unit_access(uuid, uuid, text, timestamptz)
  from public, anon, authenticated;

create function public.revoke_unit_access(
  grant_id uuid,
  reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_reason text := trim(reason);
  revoked_grant public.unit_access_grants%rowtype;
begin
  if not private.is_coordinator() then
    raise exception using
      errcode = '42501',
      message = 'Only active coordinators can revoke unit access';
  end if;

  if char_length(normalized_reason) not between 5 and 500 then
    raise exception using
      errcode = '22023',
      message = 'Revocation reason must contain between 5 and 500 characters';
  end if;

  update public.unit_access_grants as access_grant
  set
    revoked_at = now(),
    revoked_by = actor_id,
    revocation_reason = normalized_reason
  where access_grant.id = grant_id
    and access_grant.revoked_at is null
  returning access_grant.* into revoked_grant;

  if revoked_grant.id is null then
    raise exception using
      errcode = 'P0002',
      message = 'Active unit access grant not found';
  end if;

  insert into public.audit_events (
    actor_id,
    unit_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    actor_id,
    revoked_grant.unit_id,
    'unit_access_revoked',
    'unit_access_grant',
    revoked_grant.id::text,
    jsonb_build_object(
      'profile_id', revoked_grant.profile_id
    )
  );
end;
$$;

revoke all on function public.revoke_unit_access(uuid, text)
  from public, anon, authenticated;

revoke all on table public.units from public, anon, authenticated;
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.unit_access_grants from public, anon, authenticated;
revoke all on table public.audit_events from public, anon, authenticated;

grant select on table public.units to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.unit_access_grants to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_coordinator() to authenticated;
grant execute on function private.can_access_unit(uuid) to authenticated;
grant execute on function public.grant_unit_access(uuid, uuid, text, timestamptz)
  to authenticated;
grant execute on function public.revoke_unit_access(uuid, text)
  to authenticated;

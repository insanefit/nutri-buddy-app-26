\set coordinator_id '00000000-0000-4000-8000-000000000001'
\set nutritionist_id '00000000-0000-4000-8000-000000000002'
\set unit_a_id '10000000-0000-4000-8000-000000000001'
\set unit_b_id '10000000-0000-4000-8000-000000000002'

begin;

create extension if not exists pgtap with schema extensions;

select plan(30);

insert into auth.users (id, email)
values
  (:'coordinator_id', 'coordinator-access-foundation@example.invalid'),
  (:'nutritionist_id', 'nutritionist-access-foundation@example.invalid');

insert into public.units (id, name)
values
  (:'unit_a_id', 'Unidade Piloto 1'),
  (:'unit_b_id', 'Unidade Piloto 2')
on conflict (id) do update set name = excluded.name;

insert into public.profiles (id, full_name, role, primary_unit_id)
values
  (:'coordinator_id', 'Coordenação de Teste', 'coordinator', :'unit_a_id'),
  (:'nutritionist_id', 'Nutricionista de Teste', 'nutritionist', :'unit_a_id');

select ok(
  (
    select rolbypassrls
      and not rolsuper
    from pg_roles
    where rolname = 'service_role'
  ),
  'service_role keeps BYPASSRLS without becoming a superuser'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'SELECT')
  and has_table_privilege('service_role', 'public.profiles', 'INSERT')
  and has_table_privilege('service_role', 'public.profiles', 'UPDATE')
  and not has_table_privilege('service_role', 'public.profiles', 'DELETE'),
  'service_role has only the profile provisioning CRUD privileges it needs'
);

set local role service_role;

select lives_ok(
  format(
    $sql$
      insert into public.profiles (id, full_name, role, primary_unit_id)
      values (%L::uuid, %L, 'nutritionist', %L::uuid)
      on conflict (id) do update
      set
        full_name = excluded.full_name,
        role = excluded.role,
        primary_unit_id = excluded.primary_unit_id
    $sql$,
    :'nutritionist_id',
    'Perfil provisionado pela service role',
    :'unit_a_id'
  ),
  'service_role can upsert a profile for an existing auth user'
);

select lives_ok(
  format(
    $sql$
      insert into public.profiles (id, full_name, role, primary_unit_id)
      values (%L::uuid, %L, 'nutritionist', %L::uuid)
      on conflict (id) do update
      set
        full_name = excluded.full_name,
        role = excluded.role,
        primary_unit_id = excluded.primary_unit_id
    $sql$,
    :'nutritionist_id',
    'Perfil provisionado pela service role',
    :'unit_a_id'
  ),
  'repeating the service_role profile upsert is idempotent'
);

select throws_ok(
  format(
    $sql$delete from public.profiles where id = %L::uuid$sql$,
    :'nutritionist_id'
  ),
  '42501',
  null,
  'service_role cannot delete profiles'
);

reset role;

select ok(
  (
    select count(*) = 1
      and bool_and(full_name = 'Perfil provisionado pela service role')
    from public.profiles
    where id = :'nutritionist_id'
  ),
  'the idempotent service_role upsert persists exactly one valid profile'
);

select ok(
  not has_table_privilege(
    'service_role',
    'public.units',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'service_role',
    'public.unit_access_grants',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'service_role',
    'public.audit_events',
    'SELECT,INSERT,UPDATE,DELETE'
  ),
  'service_role receives no client CRUD privileges on other foundation tables'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'SELECT')
  and has_table_privilege('service_role', 'public.profiles', 'INSERT')
  and has_table_privilege('service_role', 'public.profiles', 'UPDATE')
  and not has_table_privilege(
    'service_role',
    'public.profiles',
    'DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
  )
  and not has_table_privilege(
    'service_role',
    'public.units',
    'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
  )
  and not has_table_privilege(
    'service_role',
    'public.unit_access_grants',
    'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
  )
  and not has_table_privilege(
    'service_role',
    'public.audit_events',
    'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'
  ),
  'service_role has exactly profile provisioning table privileges'
);

set local role authenticated;

select lives_ok(
  format(
    $sql$select set_config(%L, %L, true)$sql$,
    'request.jwt.claims',
    jsonb_build_object(
      'sub', :'nutritionist_id',
      'role', 'authenticated'
    )::text
  ),
  'authenticates as the Unit A nutritionist'
);

select ok(
  private.can_access_unit(:'unit_a_id')
  and (
    select count(*) = 1
    from public.profiles
    where id = :'nutritionist_id'
  ),
  'the nutritionist can access their primary unit and own profile'
);

select is(
  (
    select count(*)
    from public.units
    where id = :'unit_a_id'
  ),
  1::bigint,
  'the nutritionist can read their active primary unit'
);

select ok(
  not private.can_access_unit(:'unit_b_id')
  and not exists (
    select 1
    from public.profiles
    where id = :'coordinator_id'
  )
  and not exists (
    select 1
    from public.units
    where id = :'unit_b_id'
  )
  and not exists (
    select 1
    from public.unit_access_grants
  ),
  'the nutritionist cannot read cross-unit or coordinator data without a grant'
);

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'coordinator_id',
    'role', 'authenticated'
  )::text,
  true
);

select is(
  (select count(*) from public.units),
  2::bigint,
  'the coordinator can read both active units'
);

select lives_ok(
  format(
    $sql$
      select public.grant_unit_access(
        %L::uuid,
        %L::uuid,
        %L,
        now() + interval '1 day'
      )
    $sql$,
    :'nutritionist_id',
    :'unit_b_id',
    'Cobertura temporária autorizada'
  ),
  'a coordinator can grant temporary cross-unit access'
);

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'nutritionist_id',
    'role', 'authenticated'
  )::text,
  true
);

select ok(
  private.can_access_unit(:'unit_b_id')
  and exists (
    select 1
    from public.units
    where id = :'unit_b_id'
  )
  and (
    select count(*) = 1
    from public.unit_access_grants
    where profile_id = :'nutritionist_id'
      and unit_id = :'unit_b_id'
  ),
  'the active grant makes the other unit accessible and visible'
);

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'coordinator_id',
    'role', 'authenticated'
  )::text,
  true
);

select lives_ok(
  format(
    $sql$select public.revoke_unit_access(%L::uuid, %L)$sql$,
    (
      select id::text
      from public.unit_access_grants
      where profile_id = :'nutritionist_id'
        and unit_id = :'unit_b_id'
        and revoked_at is null
    ),
    'Cobertura temporária encerrada'
  ),
  'a coordinator can revoke cross-unit access'
);

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'nutritionist_id',
    'role', 'authenticated'
  )::text,
  true
);

select ok(
  not private.can_access_unit(:'unit_b_id')
  and not exists (
    select 1
    from public.units
    where id = :'unit_b_id'
  )
  and not exists (
    select 1
    from public.unit_access_grants
    where profile_id = :'nutritionist_id'
      and unit_id = :'unit_b_id'
  ),
  'the revoked grant no longer provides access or remains visible'
);

select throws_ok(
  format(
    $sql$
      select public.grant_unit_access(
        %L::uuid,
        %L::uuid,
        %L,
        now() + interval '1 day'
      )
    $sql$,
    :'nutritionist_id',
    :'unit_b_id',
    'Tentativa não autorizada'
  ),
  '42501',
  null,
  'a nutritionist cannot grant cross-unit access'
);

reset role;

insert into public.unit_access_grants (
  profile_id,
  unit_id,
  reason,
  granted_by,
  valid_from,
  valid_until
)
values (
  :'nutritionist_id',
  :'unit_b_id',
  'Concessão expirada para teste',
  :'coordinator_id',
  now() - interval '2 days',
  now() - interval '1 day'
);

set local role authenticated;

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'nutritionist_id',
    'role', 'authenticated'
  )::text,
  true
);

select ok(
  not private.can_access_unit(:'unit_b_id')
  and not exists (
    select 1
    from public.units
    where id = :'unit_b_id'
  )
  and not exists (
    select 1
    from public.unit_access_grants
    where profile_id = :'nutritionist_id'
      and unit_id = :'unit_b_id'
  ),
  'an expired grant does not expose the other unit'
);

reset role;

update public.units
set active = false
where id = :'unit_b_id';

set local role authenticated;

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', :'coordinator_id',
    'role', 'authenticated'
  )::text,
  true
);

select ok(
  not private.can_access_unit(:'unit_b_id')
  and not exists (
    select 1
    from public.units
    where id = :'unit_b_id'
  ),
  'an inactive unit is hidden even from a coordinator'
);

reset role;

select ok(
  not has_table_privilege(
    'anon',
    'public.units',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'public',
    'public.units',
    'SELECT,INSERT,UPDATE,DELETE'
  ),
  'anon and PUBLIC have no direct privileges on units'
);

select throws_ok(
  $sql$
    insert into public.audit_events (event_type, entity_type, metadata)
    values (
      'audit_metadata_validation',
      'test',
      '{"Clinical_Text":"x"}'::jsonb
    )
  $sql$,
  '23514',
  null,
  'audit metadata rejects prohibited root keys regardless of case'
);

select throws_ok(
  $sql$
    insert into public.audit_events (event_type, entity_type, metadata)
    values (
      'audit_metadata_validation',
      'test',
      '{"outer":{"notes":"x"}}'::jsonb
    )
  $sql$,
  '23514',
  null,
  'audit metadata rejects nested notes'
);

select throws_ok(
  $sql$
    insert into public.audit_events (event_type, entity_type, metadata)
    values (
      'audit_metadata_validation',
      'test',
      '{"level1":{"level2":{"anamnesis":"x"}}}'::jsonb
    )
  $sql$,
  '23514',
  null,
  'audit metadata rejects prohibited keys at any nesting depth'
);

select lives_ok(
  $sql$
    insert into public.audit_events (event_type, entity_type, metadata)
    values (
      'audit_metadata_validation',
      'test',
      '{"outer":{"status":"ok"},"profile_id":"safe"}'::jsonb
    )
  $sql$,
  'audit metadata accepts safe nested keys'
);

select ok(
  (
    select count(*) = 2
      and bool_and(
        not (metadata ?| array['clinical_text', 'notes', 'anamnesis'])
      )
    from public.audit_events
    where event_type in ('unit_access_granted', 'unit_access_revoked')
  )
  and not has_table_privilege(
    'authenticated',
    'public.unit_access_grants',
    'INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'authenticated',
    'public.audit_events',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'anon',
    'public.units',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'anon',
    'public.profiles',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'anon',
    'public.unit_access_grants',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_table_privilege(
    'anon',
    'public.audit_events',
    'SELECT,INSERT,UPDATE,DELETE'
  )
  and not has_function_privilege(
    'anon',
    'public.grant_unit_access(uuid,uuid,text,timestamptz)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'public.revoke_unit_access(uuid,text)',
    'EXECUTE'
  )
  and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('unit_access_grants', 'audit_events')
      and cmd <> 'SELECT'
  ),
  'audit and ACL isolation exclude clinical keys and direct writes'
);

set local role service_role;

select throws_ok(
  $sql$truncate table public.units cascade$sql$,
  '42501',
  null,
  'service_role cannot truncate units'
);

select throws_ok(
  $sql$truncate table public.profiles cascade$sql$,
  '42501',
  null,
  'service_role cannot truncate profiles'
);

select throws_ok(
  $sql$truncate table public.unit_access_grants cascade$sql$,
  '42501',
  null,
  'service_role cannot truncate unit access grants'
);

select throws_ok(
  $sql$truncate table public.audit_events cascade$sql$,
  '42501',
  null,
  'service_role cannot truncate audit events'
);

reset role;

select * from finish();

rollback;

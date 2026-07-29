insert into public.units (id, name)
values
  ('10000000-0000-4000-8000-000000000001', 'Unidade Piloto 1'),
  ('10000000-0000-4000-8000-000000000002', 'Unidade Piloto 2')
on conflict (id) do update set name = excluded.name;

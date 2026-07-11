-- Migration: tabela contracts + RLS + Realtime

create table if not exists public.contracts (
  id text primary key,
  seller jsonb not null,
  buyer jsonb not null,
  property jsonb not null,
  paid_numbers integer[] not null default '{}',
  payment_dates jsonb not null default '{}'::jsonb,
  consulta_permissions jsonb not null default '{}'::jsonb,
  published_consulta jsonb,
  updated_at timestamptz not null default now()
);

alter table public.contracts replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contracts'
  ) then
    alter publication supabase_realtime add table public.contracts;
  end if;
end $$;

alter table public.contracts enable row level security;

drop policy if exists "contracts_select_public" on public.contracts;
drop policy if exists "contracts_insert_public" on public.contracts;
drop policy if exists "contracts_update_public" on public.contracts;

create policy "contracts_select_public"
  on public.contracts
  for select
  using (true);

create policy "contracts_insert_public"
  on public.contracts
  for insert
  with check (true);

create policy "contracts_update_public"
  on public.contracts
  for update
  using (true)
  with check (true);

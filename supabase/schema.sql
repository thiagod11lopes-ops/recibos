-- Schema do sistema Recibos para Supabase (PostgreSQL)
-- Execute no SQL Editor do projeto: https://supabase.com/dashboard

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

-- Tempo real: necessário para sincronizar a consulta pública
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

-- Políticas RLS
-- Ajuste quando adicionar autenticação (Auth).
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

-- Linha inicial opcional (id = default)
-- insert into public.contracts (id, seller, buyer, property, paid_numbers, payment_dates, consulta_permissions)
-- values (
--   'default',
--   '{"name":"Thiago Lopes de Oliveira","cpf":"108.971.107-73"}'::jsonb,
--   '{"name":"Leonardo da Silva Bezerra","cpf":"126.007.197-92"}'::jsonb,
--   '{"location":"Travessa Saturno, LT 30, QD 02\nVila São João, São João de Meriti, CEP: 25570-236","totalValue":360000,"installmentCount":72,"installmentValue":5000}'::jsonb,
--   array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
--   '{}'::jsonb,
--   '{"sellerName":true,"sellerCpf":false,"buyerName":true,"buyerCpf":false,"property":true,"propertyFinancials":true,"paymentSummary":true,"progressBar":true,"paymentTableExport":false,"installmentTable":true,"showReference":true,"showDueDate":true,"showPaymentDate":true,"showValue":true,"showStatus":true}'::jsonb
-- )
-- on conflict (id) do nothing;

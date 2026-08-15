-- Schema Recibos (reference / reaplicável)
create table if not exists public.contracts (
  id text primary key,
  seller jsonb not null,
  buyer jsonb not null,
  property jsonb not null,
  paid_numbers integer[] not null default '{}',
  payment_dates jsonb not null default '{}'::jsonb,
  consulta_permissions jsonb not null default '{}'::jsonb,
  published_consulta jsonb,
  receipt_pdfs jsonb not null default '{}'::jsonb,
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

create policy "contracts_select_public" on public.contracts for select using (true);
create policy "contracts_insert_public" on public.contracts for insert with check (true);
create policy "contracts_update_public" on public.contracts for update using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('receipt-pdfs', 'receipt-pdfs', true)
on conflict (id) do nothing;

drop policy if exists "receipt_pdfs_public_read" on storage.objects;
drop policy if exists "receipt_pdfs_public_write" on storage.objects;
drop policy if exists "receipt_pdfs_public_update" on storage.objects;

create policy "receipt_pdfs_public_read" on storage.objects for select using (bucket_id = 'receipt-pdfs');
create policy "receipt_pdfs_public_write" on storage.objects for insert with check (bucket_id = 'receipt-pdfs');
create policy "receipt_pdfs_public_update" on storage.objects for update using (bucket_id = 'receipt-pdfs') with check (bucket_id = 'receipt-pdfs');

-- Bucket para PDFs de recibos anexados (execute no SQL Editor do Supabase)

insert into storage.buckets (id, name, public)
values ('receipt-pdfs', 'receipt-pdfs', true)
on conflict (id) do nothing;

drop policy if exists "receipt_pdfs_public_read" on storage.objects;
drop policy if exists "receipt_pdfs_public_write" on storage.objects;
drop policy if exists "receipt_pdfs_public_update" on storage.objects;

create policy "receipt_pdfs_public_read"
  on storage.objects for select
  using (bucket_id = 'receipt-pdfs');

create policy "receipt_pdfs_public_write"
  on storage.objects for insert
  with check (bucket_id = 'receipt-pdfs');

create policy "receipt_pdfs_public_update"
  on storage.objects for update
  using (bucket_id = 'receipt-pdfs')
  with check (bucket_id = 'receipt-pdfs');

-- Metadados dos PDFs anexados por parcela
alter table public.contracts
  add column if not exists receipt_pdfs jsonb not null default '{}'::jsonb;

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS default_contract_terms TEXT,
ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'FAC-';

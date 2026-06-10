-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmins have full access" ON public.branches;
DROP POLICY IF EXISTS "Users have access to own company data" ON public.branches;
CREATE POLICY "Superadmins have full access" ON public.branches FOR ALL TO authenticated USING (public.is_superadmin());
CREATE POLICY "Users have access to own company data" ON public.branches FOR ALL TO authenticated USING (company_id = public.get_user_company_id());

-- Add branch_id to existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;


-- 2. Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set policies for documents bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- 4. Create storefront_assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('storefront_assets', 'storefront_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set policies for storefront_assets bucket
DROP POLICY IF EXISTS "Public Access Storefront" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert Storefront" ON storage.objects;

CREATE POLICY "Public Access Storefront" ON storage.objects FOR SELECT USING (bucket_id = 'storefront_assets');
CREATE POLICY "Auth Insert Storefront" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'storefront_assets' AND auth.role() = 'authenticated');

-- 6. Add missing columns to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'orange';
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS mrr NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS storage_used_mb NUMERIC(10,2) DEFAULT 0.00;

-- 7. Create system_broadcasts table
CREATE TABLE IF NOT EXISTS public.system_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for system_broadcasts
ALTER TABLE public.system_broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active broadcasts" ON public.system_broadcasts;
DROP POLICY IF EXISTS "Superadmins can manage broadcasts" ON public.system_broadcasts;
CREATE POLICY "Anyone can read active broadcasts" ON public.system_broadcasts FOR SELECT TO authenticated USING (active = TRUE OR public.is_superadmin());
CREATE POLICY "Superadmins can manage broadcasts" ON public.system_broadcasts FOR ALL TO authenticated USING (public.is_superadmin());

-- Make sure schema cache is reloaded
NOTIFY pgrst, 'reload schema';

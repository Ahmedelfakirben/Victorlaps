-- Create branches table
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

-- Make sure schema cache is reloaded
NOTIFY pgrst, 'reload schema';

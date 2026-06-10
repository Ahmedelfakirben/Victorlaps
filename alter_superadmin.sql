-- Add new columns to companies for Superadmin metrics
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS mrr NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS storage_used_mb NUMERIC(10,2) DEFAULT 0.00;

-- Create system_broadcasts table
CREATE TABLE IF NOT EXISTS public.system_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for system_broadcasts
ALTER TABLE public.system_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active broadcasts" 
ON public.system_broadcasts FOR SELECT 
TO authenticated 
USING (active = TRUE OR public.is_superadmin());

CREATE POLICY "Superadmins can manage broadcasts" 
ON public.system_broadcasts FOR ALL 
TO authenticated 
USING (public.is_superadmin());

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';

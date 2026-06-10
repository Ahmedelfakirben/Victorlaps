ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'orange';
NOTIFY pgrst, 'reload schema';

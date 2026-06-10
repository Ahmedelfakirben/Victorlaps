-- 1. Añadir campos a la tabla companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS storefront_config JSONB DEFAULT '{
  "themeColor": "#10b981",
  "whatsapp": "",
  "instagram": "",
  "facebook": "",
  "aboutText": "",
  "heroTitle": "Alquiler de Vehículos",
  "heroSubtitle": "La mejor flota al mejor precio"
}'::jsonb;

-- 2. Permitir lectura pública para que el escaparate pueda cargar los datos
DROP POLICY IF EXISTS "Public storefront view" ON public.companies;
CREATE POLICY "Public storefront view"
ON public.companies
FOR SELECT
TO public
USING (status = 'active');

-- 3. Permitir lectura pública de vehículos disponibles
DROP POLICY IF EXISTS "Public vehicles view" ON public.vehicles;
CREATE POLICY "Public vehicles view"
ON public.vehicles
FOR SELECT
TO public
USING (status = 'available');

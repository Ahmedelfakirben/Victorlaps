-- Script para asegurar los Buckets de Supabase y Aislar datos por Tenant (Agencia)

-- 1. Asegurarnos de que RLS está activado en la tabla de storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Primero borramos las políticas anteriores si existen para evitar conflictos
DROP POLICY IF EXISTS "Tenant users can view their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can update their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Tenant users can delete from their own folder" ON storage.objects;

-- 2. Política de LECTURA: Un usuario solo puede leer archivos si la carpeta coincide con su company_id
CREATE POLICY "Tenant users can view their own folder"
ON storage.objects FOR SELECT
USING (
  (storage.foldername(name))[1] = (
    SELECT company_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 3. Política de SUBIDA: Un usuario solo puede insertar archivos si el destino es su carpeta
CREATE POLICY "Tenant users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  (storage.foldername(name))[1] = (
    SELECT company_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 4. Política de EDICIÓN:
CREATE POLICY "Tenant users can update their own folder"
ON storage.objects FOR UPDATE
USING (
  (storage.foldername(name))[1] = (
    SELECT company_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 5. Política de BORRADO:
CREATE POLICY "Tenant users can delete from their own folder"
ON storage.objects FOR DELETE
USING (
  (storage.foldername(name))[1] = (
    SELECT company_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

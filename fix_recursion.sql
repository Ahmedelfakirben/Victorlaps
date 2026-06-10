-- Eliminar la política que causa el bucle infinito
DROP POLICY IF EXISTS "Admins can manage profiles in their company" ON public.profiles;

-- Crear una función segura que no hace recursión
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE is_ad BOOLEAN;
BEGIN
  SELECT role = 'admin' INTO is_ad FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(is_ad, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Recrear la política usando la función segura
CREATE POLICY "Admins can manage profiles in their company" ON public.profiles FOR ALL TO authenticated USING (company_id = get_user_company_id() AND is_admin());

-- Refrescar postgrest
NOTIFY pgrst, 'reload schema';

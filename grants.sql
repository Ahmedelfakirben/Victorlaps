-- Conceder acceso básico al esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Conceder permisos sobre todas las tablas existentes a los roles de Supabase
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Asegurarse de que las futuras tablas también tengan estos permisos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';

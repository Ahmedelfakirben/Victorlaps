import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Código SQL para crear buckets y habilitar políticas RLS permisivas y seguras
  const sql = `
-- 1. Insertar buckets en la tabla storage.buckets si no existen
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('vehicles', 'vehicles', true),
  ('documents', 'documents', true),
  ('clients', 'clients', true),
  ('temp', 'temp', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 4. Crear políticas RLS para permitir accesos a usuarios del ERP
-- Permitir que CUALQUIERA (público) lea los archivos (requerido para ver fotos de coches, etc.)
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT TO public USING (true);

-- Permitir que usuarios AUTENTICADOS puedan subir archivos
CREATE POLICY "Authenticated Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Permitir que usuarios AUTENTICADOS puedan actualizar archivos
CREATE POLICY "Authenticated Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (true);

-- Permitir que usuarios AUTENTICADOS puedan borrar archivos
CREATE POLICY "Authenticated Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (true);
  `;
  
  console.log('📦 Conectado. Creando buckets y configurando políticas RLS de Almacenamiento en el VPS...');

  // Codificar el SQL en Base64 para evitar cualquier problema de escape o saltos de línea CRLF de Windows
  const base64Sql = Buffer.from(sql.trim()).toString('base64');
  const writeSqlCmd = `echo "${base64Sql}" | base64 -d > /tmp/create_buckets.sql`;
  
  conn.exec(writeSqlCmd, async (err, stream) => {
    if (err) throw err;
    stream.on('close', async () => {
      // Copiar el archivo al contenedor y ejecutarlo
      const runCmd = `
        docker cp /tmp/create_buckets.sql supabase-db-qxcax1lm4sxvwiyox2b3qn6n:/tmp/create_buckets.sql &&
        docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -f /tmp/create_buckets.sql &&
        docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n rm -f /tmp/create_buckets.sql &&
        rm -f /tmp/create_buckets.sql
      `;
      
      conn.exec(runCmd, (err2, stream2) => {
        if (err2) throw err2;
        let stdout = '';
        let stderr = '';
        stream2.on('close', (code) => {
          console.log('\n--- RESULTADO DE LA CONFIGURACIÓN DEL STORAGE ---');
          console.log('Exit Code:', code);
          if (code === 0) {
            console.log('🎉 ¡Buckets creados y políticas RLS configuradas con éxito!');
            console.log('Buckets creados: "vehicles", "documents", "clients" y "temp".');
            console.log('Las políticas RLS ahora permiten a tus empleados autenticados subir y gestionar fotos.');
          } else {
            console.error('❌ Error al configurar el Storage:');
            console.error(stderr);
          }
          console.log('-------------------------------------------------');
          conn.end();
        }).on('data', (data) => {
          stdout += data.toString();
        }).stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
  });
}).connect({
  host: '49.13.52.159',
  port: 22,
  username: 'root',
  password: 'satec2016'
});

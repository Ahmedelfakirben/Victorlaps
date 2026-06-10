import { Client } from 'ssh2';

const QUERIES = [
  // 1. Crear los buckets si no existen
  "INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true) ON CONFLICT (id) DO NOTHING;",
  "INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;",
  "INSERT INTO storage.buckets (id, name, public) VALUES ('clients', 'clients', true) ON CONFLICT (id) DO NOTHING;",
  "INSERT INTO storage.buckets (id, name, public) VALUES ('temp', 'temp', true) ON CONFLICT (id) DO NOTHING;",

  // 2. Activar RLS
  "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;",

  // 3. Limpiar políticas antiguas
  "DROP POLICY IF EXISTS \\\"Public Access\\\" ON storage.objects;",
  "DROP POLICY IF EXISTS \\\"Authenticated Insert\\\" ON storage.objects;",
  "DROP POLICY IF EXISTS \\\"Authenticated Update\\\" ON storage.objects;",
  "DROP POLICY IF EXISTS \\\"Authenticated Delete\\\" ON storage.objects;",

  // 4. Crear políticas RLS seguras
  "CREATE POLICY \\\"Public Access\\\" ON storage.objects FOR SELECT TO public USING (true);",
  "CREATE POLICY \\\"Authenticated Insert\\\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);",
  "CREATE POLICY \\\"Authenticated Update\\\" ON storage.objects FOR UPDATE TO authenticated USING (true);",
  "CREATE POLICY \\\"Authenticated Delete\\\" ON storage.objects FOR DELETE TO authenticated USING (true);"
];

const conn = new Client();

function runQuery(conn, sql) {
  return new Promise((resolve) => {
    // Escapar comillas dobles y caracteres en la llamada bash
    const cmd = `docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${sql}"`;
    
    conn.exec(cmd, (err, stream) => {
      if (err) return resolve({ success: false, error: err.message });
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout: stdout.trim() });
        } else {
          resolve({ success: false, error: stderr.trim() || stdout.trim() });
        }
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('📡 Conexión SSH establecida con el VPS.');
  console.log('⚡ Iniciando ejecución secuencial de consultas SQL de Storage...');

  for (let i = 0; i < QUERIES.length; i++) {
    const sql = QUERIES[i];
    process.stdout.write(`[${i + 1}/${QUERIES.length}] Ejecutando consulta... `);
    
    const result = await runQuery(conn, sql);
    if (result.success) {
      console.log('✅ ¡Éxito!');
    } else {
      console.log(`❌ FALLÓ: ${result.error}`);
    }
  }

  console.log('\n🏁 ¡Proceso de inicialización de Storage finalizado!');
  conn.end();
}).connect({
  host: '49.13.52.159',
  port: 22,
  username: 'root',
  password: 'satec2016'
});

import pg from 'pg';

const CLOUD_DB_HOST = 'aws-0-eu-west-1.pooler.supabase.com';
const CLOUD_DB_USER = 'postgres.sheejspqhpmdlgzkpncd';
const CLOUD_DB_PORT = 6543;
const CLOUD_DB_NAME = 'postgres';
const CLOUD_DB_PASSWORD = 'Satec2016C@U';

async function listFiles() {
  const client = new pg.Client({
    host: CLOUD_DB_HOST,
    port: CLOUD_DB_PORT,
    database: CLOUD_DB_NAME,
    user: CLOUD_DB_USER,
    password: CLOUD_DB_PASSWORD
  });

  try {
    await client.connect();
    console.log('📡 Conectado a la base de datos de Supabase Cloud.');
    
    // 1. Listar buckets
    console.log('\n--- BUCKETS ENCONTRADOS ---');
    const bucketsRes = await client.query('SELECT id, name, public FROM storage.buckets');
    console.table(bucketsRes.rows);

    // 2. Listar archivos
    console.log('\n--- ARCHIVOS EN STORAGE.OBJECTS ---');
    const filesRes = await client.query(`
      SELECT 
        bucket_id, 
        name, 
        (metadata->>'size')::int as size_bytes,
        created_at 
      FROM storage.objects
      ORDER BY bucket_id, name
    `);
    
    if (filesRes.rows.length === 0) {
      console.log('No se encontraron registros de archivos en storage.objects.');
    } else {
      console.table(filesRes.rows.map(r => ({
        Bucket: r.bucket_id,
        Path: r.name,
        'Size (KB)': r.size_bytes ? Math.round(r.size_bytes / 1024) : 'Desconocido',
        Created: r.created_at
      })));
    }

  } catch (err) {
    console.error('❌ Error al consultar la base de datos:', err.message);
  } finally {
    await client.end();
  }
}

listFiles();

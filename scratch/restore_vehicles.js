import pg from 'pg';
import { Client } from 'ssh2';

// Configuración de Supabase Cloud (Origen)
const CLOUD_CONFIG = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.sheejspqhpmdlgzkpncd',
  password: 'Satec2016C@U'
};

// Configuración del VPS (Destino)
const SSH_HOST = '49.13.52.159';
const SSH_USER = 'root';
const SSH_PASSWORD = 'satec2016';

async function migrateVehicles() {
  console.log('📥 Conectando a Supabase Cloud para extraer los vehículos...');
  const cloudClient = new pg.Client(CLOUD_CONFIG);
  
  let vehicles = [];
  try {
    await cloudClient.connect();
    const res = await cloudClient.query('SELECT * FROM public.vehicles');
    vehicles = res.rows;
    console.log(`✅ Se encontraron ${vehicles.length} vehículos en la nube.`);
  } catch (err) {
    console.error('❌ Error al obtener vehículos de Cloud:', err.message);
    await cloudClient.end();
    return;
  } finally {
    await cloudClient.end();
  }

  if (vehicles.length === 0) {
    console.log('No hay vehículos para migrar.');
    return;
  }

  // Preparar la conexión SSH al VPS para la inserción
  console.log('\n📡 Conectando al VPS por SSH para restaurar los vehículos...');
  const conn = new Client();
  
  conn.on('ready', () => {
    console.log('⚡ Conexión SSH establecida con el VPS.');
    
    // Construir la consulta de inserción masiva
    // Reseteamos image_url a NULL para evitar el enlace roto del storage bloqueado de Cloud
    let sql = 'INSERT INTO public.vehicles (id, plate, brand, model, year, fuel, color, seats, transmission, status, daily_rate, current_km, image_url, notes, created_at, updated_at) VALUES ';
    
    const values = vehicles.map(v => {
      const id = `'${v.id}'`;
      const plate = `'${v.plate.replace(/'/g, "''")}'`;
      const brand = `'${v.brand.replace(/'/g, "''")}'`;
      const model = `'${v.model.replace(/'/g, "''")}'`;
      const year = v.year;
      const fuel = `'${v.fuel}'`;
      const color = v.color ? `'${v.color.replace(/'/g, "''")}'` : 'NULL';
      const seats = v.seats || 5;
      const transmission = v.transmission ? `'${v.transmission}'` : 'NULL';
      const status = `'${v.status}'`;
      const daily_rate = v.daily_rate;
      const current_km = v.current_km || 0;
      const image_url = 'NULL'; // Limpiamos la URL rota de la nube
      const notes = v.notes ? `'${v.notes.replace(/'/g, "''")}'` : 'NULL';
      const created_at = `'${v.created_at.toISOString()}'`;
      const updated_at = `'${v.updated_at.toISOString()}'`;
      
      return `(${id}, ${plate}, ${brand}, ${model}, ${year}, ${fuel}, ${color}, ${seats}, ${transmission}, ${status}, ${daily_rate}, ${current_km}, ${image_url}, ${notes}, ${created_at}, ${updated_at})`;
    }).join(', ');
    
    sql += values + ' ON CONFLICT (id) DO UPDATE SET plate=EXCLUDED.plate, brand=EXCLUDED.brand, model=EXCLUDED.model, year=EXCLUDED.year, fuel=EXCLUDED.fuel, color=EXCLUDED.color, seats=EXCLUDED.seats, transmission=EXCLUDED.transmission, status=EXCLUDED.status, daily_rate=EXCLUDED.daily_rate, current_km=EXCLUDED.current_km, image_url=EXCLUDED.image_url, notes=EXCLUDED.notes, updated_at=EXCLUDED.updated_at;';
    
    // Ejecutar el SQL de inserción en el VPS usando psql
    conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${sql}"`, (err, stream) => {
      if (err) throw err;
      let stdout = '';
      let stderr = '';
      
      stream.on('close', (code) => {
        console.log('\n--- RESULTADO DE LA RESTAURACIÓN ---');
        console.log('Exit Code:', code);
        if (code === 0) {
          console.log(`🎉 ¡Los ${vehicles.length} vehículos se han migrado e insertado con éxito en el VPS!`);
          console.log('Los datos técnicos (matrículas, marcas, kilómetros, etc.) están listos.');
          console.log('Las imágenes se han dejado limpias para que puedas subir las fotos reales desde tu ERP.');
        } else {
          console.error('❌ Error al insertar vehículos en el VPS:');
          console.error(stderr || stdout);
        }
        console.log('------------------------------------');
        conn.end();
      }).on('data', (data) => {
        stdout += data;
      }).stderr.on('data', (data) => {
        stderr += data;
      });
    });
  }).connect({
    host: SSH_HOST,
    port: 22,
    username: SSH_USER,
    password: SSH_PASSWORD
  });
}

migrateVehicles();

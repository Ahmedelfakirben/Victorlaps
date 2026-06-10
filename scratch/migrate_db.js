import { Client } from 'ssh2';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN SSH Y DATOS
// ==========================================
const SSH_HOST = '49.13.52.159';
const SSH_USER = 'root';
const SSH_PASSWORD = 'satec2016';

// Identificador único de tu servicio en Coolify
const SERVICE_ID = 'qxcax1lm4sxvwiyox2b3qn6n';

// Datos de Supabase Cloud
const CLOUD_DB_HOST = 'aws-0-eu-west-1.pooler.supabase.com';
const CLOUD_DB_USER = 'postgres.sheejspqhpmdlgzkpncd';
const CLOUD_DB_PORT = '6543';
const CLOUD_DB_NAME = 'postgres';

// Contraseña de tu base de datos en Supabase Cloud (Ingrésala aquí)
const CLOUD_DB_PASSWORD = 'Satec2016C@U';

// Contraseña de tu base de datos en el VPS (Extraída de tus variables de Coolify)
const VPS_DB_PASSWORD = 'b7s1RM0Suc5JTCM1jowdMQjc1BSyXcDt';

if (CLOUD_DB_PASSWORD.includes('INTRODUCE')) {
  console.error('⚠️  Por favor, edita este archivo e introduce la contraseña de tu base de datos de Supabase Cloud en la variable CLOUD_DB_PASSWORD.');
  process.exit(1);
}

const conn = new Client();

function executeCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('📡 Conexión SSH establecida con éxito con el VPS.');

  try {
    // 1. Identificar el contenedor de PostgreSQL
    console.log('🔍 Buscando el contenedor de Postgres para el servicio en Coolify...');
    const findContainerCmd = `docker ps -a | grep ${SERVICE_ID} | grep supabase-db`;
    const { stdout: containerList, code: containerCode } = await executeCommand(conn, findContainerCmd);
    
    if (containerCode !== 0 || !containerList.trim()) {
      throw new Error('No se pudo encontrar el contenedor de PostgreSQL de este proyecto en el VPS.');
    }

    // Extraer el nombre del contenedor (suele ser el último elemento de la línea)
    const lines = containerList.trim().split('\n');
    const parts = lines[0].split(/\s+/);
    const containerName = parts[parts.length - 1];
    console.log(`✅ Contenedor encontrado: "${containerName}"`);

    // 2. Ejecutar pg_dump del esquema public usando un contenedor Postgres 17 temporal
    console.log('\n📥 Descargando esquema público (ERP Rentacar) desde Supabase Cloud usando Postgres 17...');
    const dumpPublicCmd = `docker run --rm -v /tmp:/tmp -e PGPASSWORD="${CLOUD_DB_PASSWORD}" postgres:17-alpine pg_dump -h ${CLOUD_DB_HOST} -U ${CLOUD_DB_USER} -p ${CLOUD_DB_PORT} -d ${CLOUD_DB_NAME} --schema=public -f /tmp/public_schema.sql`;
    const dumpPublicRes = await executeCommand(conn, dumpPublicCmd);
    
    if (dumpPublicRes.code !== 0) {
      console.error('Detalles del error:', dumpPublicRes.stderr);
      throw new Error('Fallo al descargar el esquema público de Supabase Cloud. Verifica la contraseña de tu base de datos de Cloud o tu conexión.');
    }
    console.log('✅ Esquema público descargado con éxito en el VPS (/tmp/public_schema.sql).');

    // 3. Ejecutar pg_dump de los usuarios de auth usando un contenedor Postgres 17 temporal
    console.log('\n📥 Descargando usuarios de autenticación desde Supabase Cloud usando Postgres 17...');
    const dumpAuthCmd = `docker run --rm -v /tmp:/tmp -e PGPASSWORD="${CLOUD_DB_PASSWORD}" postgres:17-alpine pg_dump -h ${CLOUD_DB_HOST} -U ${CLOUD_DB_USER} -p ${CLOUD_DB_PORT} -d ${CLOUD_DB_NAME} --data-only --table=auth.users --table=auth.identities -f /tmp/auth_data.sql`;
    const dumpAuthRes = await executeCommand(conn, dumpAuthCmd);
    
    if (dumpAuthRes.code !== 0) {
      console.error('Detalles del error:', dumpAuthRes.stderr);
      throw new Error('Fallo al descargar los usuarios de autenticación de Supabase Cloud.');
    }
    console.log('✅ Usuarios de autenticación descargados con éxito en el VPS (/tmp/auth_data.sql).');

    // 4. Copiar los archivos de dump desde el VPS host al contenedor de la base de datos
    console.log('\n📦 Copiando archivos de respaldo dentro del contenedor de base de datos...');
    const cpPublicCmd = `docker cp /tmp/public_schema.sql ${containerName}:/tmp/public_schema.sql`;
    await executeCommand(conn, cpPublicCmd);
    
    const cpAuthCmd = `docker cp /tmp/auth_data.sql ${containerName}:/tmp/auth_data.sql`;
    await executeCommand(conn, cpAuthCmd);
    console.log('✅ Archivos copiados correctamente.');

    // 5. Restaurar el esquema public en el Postgres local del VPS usando supabase_admin
    console.log('\n📤 Restaurando esquema público en tu nuevo Postgres en el VPS...');
    const restorePublicCmd = `docker exec ${containerName} psql -U supabase_admin -d postgres -f /tmp/public_schema.sql`;
    const restorePublicRes = await executeCommand(conn, restorePublicCmd);
    
    if (restorePublicRes.code !== 0) {
      console.error('Detalles del error:', restorePublicRes.stderr);
      throw new Error('Fallo al restaurar el esquema público en el VPS.');
    }
    console.log('✅ Esquema público restaurado con éxito.');

    // 6. Restaurar los usuarios de autenticación en el VPS usando supabase_admin
    console.log('\n📤 Restaurando usuarios de autenticación en tu nuevo Postgres en el VPS...');
    const restoreAuthCmd = `
      docker exec ${containerName} psql -U supabase_admin -d postgres -c "ALTER TABLE auth.users DISABLE TRIGGER ALL;" &&
      docker exec ${containerName} psql -U supabase_admin -d postgres -f /tmp/auth_data.sql &&
      docker exec ${containerName} psql -U supabase_admin -d postgres -c "ALTER TABLE auth.users ENABLE TRIGGER ALL;"
    `;
    const restoreAuthRes = await executeCommand(conn, restoreAuthCmd);
    
    if (restoreAuthRes.code !== 0) {
      console.error('Detalles del error:', restoreAuthRes.stderr);
      throw new Error('Fallo al restaurar los usuarios de autenticación en el VPS.');
    }
    console.log('✅ Usuarios de autenticación restaurados con éxito.');

    // 7. Limpieza de archivos temporales
    console.log('\n🧹 Limpiando archivos temporales en el VPS...');
    await executeCommand(conn, `docker exec ${containerName} rm -f /tmp/public_schema.sql /tmp/auth_data.sql`);
    await executeCommand(conn, `rm -f /tmp/public_schema.sql /tmp/auth_data.sql`);
    console.log('✅ Limpieza completada.');

    console.log('\n🎉 ¡MIGRACIÓN DE BASE DE DATOS COMPLETADA CON ÉXITO! 🎉');

  } catch (error) {
    console.error(`\n❌ Error durante la migración:`, error.message);
  } finally {
    conn.end();
  }
}).connect({
  host: SSH_HOST,
  port: 22,
  username: SSH_USER,
  password: SSH_PASSWORD
});

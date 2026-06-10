import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURACIÓN DE MIGRACIÓN DE STORAGE
// ==========================================
const CLOUD_URL = 'https://sheejspqhpmdlgzkpncd.supabase.co';
// Ingresa aquí la Service Role Key de Supabase Cloud
const CLOUD_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZWVqc3BxaHBtZGxnemtwbmNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExNTk4MiwiZXhwIjoyMDkyNjkxOTgyfQ.nFETTXA9-QYKuvQOtHSutu7-On878nOpnsrxjDEXnek';

const VPS_URL = 'http://supabasekong-qxcax1lm4sxvwiyox2b3qn6n.49.13.52.159.sslip.io';
// Ingresa aquí la Service Role Key de tu VPS (la que tiene acceso total)
const VPS_SERVICE_ROLE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDI2MzE4MCwiZXhwIjo0OTM1OTM2NzgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.t1A23tYD5A31KoG9wQoVtJR3-QsMngnk9KXoOOqWQKU';

if (
  CLOUD_SERVICE_ROLE_KEY.includes('INTRODUCE') ||
  VPS_SERVICE_ROLE_KEY.includes('INTRODUCE')
) {
  console.error('⚠️  Por favor, edita este archivo e introduce las claves service_role correctas para Cloud y VPS.');
  process.exit(1);
}

// Inicializar clientes con privilegios de administrador (Service Role)
const cloudClient = createClient(CLOUD_URL, CLOUD_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const vpsClient = createClient(VPS_URL, VPS_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Función recursiva para listar todos los archivos de un bucket
async function listAllFiles(client, bucketName, folderPath = '') {
  let filesList = [];
  const { data, error } = await client.storage.from(bucketName).list(folderPath);

  if (error) {
    console.error(`Error listando archivos en ${bucketName}/${folderPath}:`, error.message);
    return [];
  }

  for (const item of data) {
    const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
    
    if (item.id === null) {
      // Es una carpeta/directorio, buscar recursivamente
      const subFiles = await listAllFiles(client, bucketName, fullPath);
      filesList = filesList.concat(subFiles);
    } else {
      // Es un archivo
      filesList.push(fullPath);
    }
  }
  
  return filesList;
}

async function migrateStorage() {
  console.log('🚀 Iniciando migración de Storage...');
  
  // 1. Obtener la lista de buckets de Cloud
  const { data: buckets, error: bucketsError } = await cloudClient.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Error al obtener los buckets de Cloud:', bucketsError.message);
    return;
  }
  
  console.log(`📦 Encontrados ${buckets.length} buckets en Cloud.`);

  for (const bucket of buckets) {
    console.log(`\n----------------------------------------`);
    console.log(`📁 Procesando Bucket: "${bucket.name}" (Público: ${bucket.public})`);
    console.log(`----------------------------------------`);

    // 2. Comprobar o crear el bucket en el VPS
    const { data: vpsBuckets, error: vpsBucketsError } = await vpsClient.storage.listBuckets();
    if (vpsBucketsError) {
      console.error('❌ Error al listar buckets en el VPS:', vpsBucketsError.message);
      continue;
    }

    const existsOnVps = vpsBuckets.some(b => b.name === bucket.name);
    if (!existsOnVps) {
      console.log(`➕ Creando bucket "${bucket.name}" en el VPS...`);
      const { error: createError } = await vpsClient.storage.createBucket(bucket.name, {
        public: bucket.public
      });
      if (createError) {
        console.error(`❌ Error al crear el bucket "${bucket.name}" en el VPS:`, createError.message);
        continue;
      }
      console.log(`✅ Bucket "${bucket.name}" creado con éxito.`);
    } else {
      console.log(`✓ El bucket "${bucket.name}" ya existe en el VPS.`);
    }

    // 3. Listar todos los archivos de este bucket en Cloud
    console.log(`🔍 Escaneando archivos en Cloud para "${bucket.name}"...`);
    const files = await listAllFiles(cloudClient, bucket.name);
    console.log(`📄 Encontrados ${files.length} archivos.`);

    // 4. Descargar y subir cada archivo
    let successCount = 0;
    let failCount = 0;

    for (const filePath of files) {
      console.log(`⏳ Migrando archivo: [${bucket.name}] ${filePath} ...`);
      
      // Descargar desde Cloud
      const { data: fileData, error: downloadError } = await cloudClient.storage
        .from(bucket.name)
        .download(filePath);

      if (downloadError) {
        console.error(`❌ Error al descargar "${filePath}":`, downloadError.message);
        failCount++;
        continue;
      }

      // Subir al VPS
      const { error: uploadError } = await vpsClient.storage
        .from(bucket.name)
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error(`❌ Error al subir "${filePath}" al VPS:`, uploadError.message);
        failCount++;
      } else {
        console.log(`✅ ¡Éxito! [${bucket.name}] ${filePath}`);
        successCount++;
      }
    }

    console.log(`\n🎉 Resumen del bucket "${bucket.name}":`);
    console.log(`   - Completados con éxito: ${successCount}`);
    console.log(`   - Errores/Fallidos: ${failCount}`);
  }

  console.log('\n🏁 ¡Migración de Storage completada!');
}

migrateStorage();

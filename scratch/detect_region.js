import pg from 'pg';

const PROJECT_REF = 'sheejspqhpmdlgzkpncd';
const USERNAME = `postgres.${PROJECT_REF}`;
const PASSWORD = 'Satec2016C@U';

const REGIONS = [
  'eu-west-1',       // Ireland
  'eu-west-2',       // London
  'eu-west-3',       // Paris
  'eu-central-1',    // Frankfurt (tested, but let\'s keep it in the list)
  'us-east-1',       // N. Virginia
  'us-east-2',       // Ohio
  'us-west-1',       // N. California
  'us-west-2',       // Oregon
  'ca-central-1',    // Central Canada
  'ap-southeast-1',  // Singapore
  'ap-northeast-1',  // Tokyo
  'ap-northeast-2',  // Seoul
  'ap-south-1',      // Mumbai
  'sa-east-1',       // São Paulo
  'me-central-1',    // Middle East
  'af-south-1'       // Cape Town
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new pg.Client({
    host,
    port: 6543,
    database: 'postgres',
    user: USERNAME,
    password: PASSWORD,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    await client.end();
    return { success: true, region };
  } catch (err) {
    // Si da error de autenticación fallida (contraseña incorrecta o similar),
    // significa que el inquilino SÍ existe en esa región!
    if (err.message.includes('password authentication failed') || err.message.includes('autenticación password falló')) {
      return { success: true, region, error: 'auth_fail' };
    }
    // Si dice tenant/user not found, no está en esta región
    if (err.message.includes('not found') || err.message.includes('ENOTFOUND')) {
      return { success: false, region, error: 'not_found' };
    }
    return { success: false, region, error: err.message };
  }
}

async function detect() {
  console.log('🔍 Iniciando detección inteligente de región de AWS para tu proyecto...');
  console.log(`Proyecto: ${PROJECT_REF}\n`);

  for (const region of REGIONS) {
    process.stdout.write(`Prueba en región: ${region.padEnd(15)} ... `);
    const result = await checkRegion(region);
    if (result.success) {
      console.log(`\n\n🎉 ¡REGIÓN DETECTADA CON ÉXITO! 🎉`);
      console.log(`Tu base de datos de Supabase Cloud está alojada en: **${region}**`);
      console.log(`Host del pooler: **aws-0-${region}.pooler.supabase.com**`);
      process.exit(0);
    } else {
      console.log(`❌ (No está aquí: ${result.error})`);
    }
  }

  console.log('\n❌ No se pudo detectar la región en los servidores habituales.');
}

detect();

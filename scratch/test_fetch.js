// Usando la API fetch nativa de Node.js

const URLS = [
  'http://supabasekong-qxcax1lm4sxvwiyox2b3qn6n.49.13.52.159.sslip.io:8000/auth/v1/health'
];

async function run() {
  console.log('📡 Probando llamadas HTTP a la API de tu Supabase VPS...');
  
  for (const url of URLS) {
    console.log(`\n---------------------------------------`);
    console.log(`Petición GET a: ${url}`);
    console.log(`---------------------------------------`);
    
    try {
      const start = Date.now();
      const res = await fetch(url, { method: 'GET', timeout: 5000 });
      const duration = Date.now() - start;
      
      console.log(`🟢 Respuesta recibida en ${duration}ms!`);
      console.log(`Estatus HTTP: ${res.status} ${res.statusText}`);
      
      const headers = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      console.log('Cabeceras:', JSON.stringify(headers, null, 2));
      
      const text = await res.text();
      console.log('Cuerpo:', text);
      
    } catch (err) {
      console.error(`❌ Error al conectar:`, err.message);
    }
  }
}

run();

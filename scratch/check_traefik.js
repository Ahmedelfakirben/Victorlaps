import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Buscar las etiquetas de traefik del contenedor de Kong en el VPS
  conn.exec('docker inspect supabase-kong-qxcax1lm4sxvwiyox2b3qn6n', (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- DETALLES DEL CONTENEDOR KONG EN DOCKER ---');
      try {
        const data = JSON.parse(stdout);
        const labels = data[0]?.Config?.Labels || {};
        console.log('Etiquetas de Traefik encontradas:');
        for (const [k, v] of Object.entries(labels)) {
          if (k.includes('traefik')) {
            console.log(`  ${k}: ${v}`);
          }
        }
      } catch (e) {
        console.log('Error parsing JSON:', e.message);
        console.log(stdout);
      }
      console.log('---------------------------------------------');
      conn.end();
    }).on('data', (data) => {
      stdout += data;
    }).stderr.on('data', (data) => {
      stderr += data;
    });
  });
}).connect({
  host: '49.13.52.159',
  port: 22,
  username: 'root',
  password: 'satec2016'
});

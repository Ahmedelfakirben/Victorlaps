import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker ps -a | grep qxcax1lm4sxvwiyox2b3qn6n', (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('--- CONTENEDORES DE SUPABASE EN EL VPS ---');
      console.log(stdout);
      console.log('-----------------------------------------');
      conn.end();
    }).on('data', (data) => {
      stdout += data;
    });
  });
}).connect({
  host: '49.13.52.159',
  port: 22,
  username: 'root',
  password: 'satec2016'
});

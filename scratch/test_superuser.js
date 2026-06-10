import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Probar ejecutar psql como supabase_admin
  conn.exec('docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "SELECT current_user;"', (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- TEST SUPERUSER ---');
      console.log('Exit Code:', code);
      console.log('Stdout:', stdout);
      console.log('Stderr:', stderr);
      console.log('----------------------');
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

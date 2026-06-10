import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Consultar si existe el trigger on_auth_user_created en auth.users en el VPS
  const query = `
    SELECT trigger_name, event_manipulation, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'auth' AND event_object_table = 'users';
  `;
  
  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${query}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- TRIGGERS ACTIVOS EN AUTH.USERS EN EL VPS ---');
      console.log(stdout);
      console.log('------------------------------------------------');
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

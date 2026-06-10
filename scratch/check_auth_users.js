import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT id, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data
    FROM auth.users;
  `;
  
  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${query}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- USUARIOS EN AUTH.USERS EN EL VPS ---');
      console.log(stdout);
      console.log('----------------------------------------');
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

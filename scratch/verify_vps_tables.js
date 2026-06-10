import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Consultar todas las tablas y vistas en el esquema public del VPS
  const query = `
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_type, table_name;
  `;
  
  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${query}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- TABLAS Y VISTAS EXISTENTES EN EL VPS (ESQUEMA PUBLIC) ---');
      console.log(stdout);
      console.log('-------------------------------------------------------------');
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

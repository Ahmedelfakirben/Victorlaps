import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT 
      table_name, 
      (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
    FROM (
      SELECT 
        table_name, 
        query_to_xml(format('select count(*) as cnt from %I.%I', table_schema, table_name), false, true, '') as xml_count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ) sub
    ORDER BY table_name;
  `;
  
  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${query}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- RECUENTO DE FILAS POR TABLA EN EL VPS ---');
      console.log(stdout);
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

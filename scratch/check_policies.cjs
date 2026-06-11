const { Client } = require('ssh2');

const SSH_HOST = '46.224.62.53';
const SSH_USER = 'root';
const SSH_PASSWORD = 'satec2016';

const conn = new Client();

function executeCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('📡 SSH Connected to VPS');
  try {
    const dbContainer = 'supabase-db-cw0o08g4gwokc4cgss840kcg';
    const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename IN ('vehicles', 'companies', 'profiles', 'clients');
    `;
    const { stdout, stderr } = await executeCommand(conn, `docker exec ${dbContainer} psql -U supabase_admin -d postgres -c "${query.replace(/\n/g, ' ')}"`);
    console.log('Policies:\n', stdout);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Connection Error:', err.message);
}).connect({
  host: SSH_HOST,
  port: 22,
  username: SSH_USER,
  password: SSH_PASSWORD
});

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
  console.log('📡 SSH Connected to VPS 46.224.62.53');
  try {
    const dbContainer = 'supabase-db-cw0o08g4gwokc4cgss840kcg';
    const localSqlPath = path.join(__dirname, '..', 'storage_rls_policies.sql');
    const sqlContent = fs.readFileSync(localSqlPath, 'utf8');

    console.log('Writing storage RLS SQL file to VPS...');
    await executeCommand(conn, `echo '${sqlContent.replace(/'/g, "'\\''")}' > /tmp/storage_rls_policies.sql`);
    
    console.log('Copying SQL file to database container...');
    await executeCommand(conn, `docker cp /tmp/storage_rls_policies.sql ${dbContainer}:/tmp/storage_rls_policies.sql`);

    console.log('Applying RLS policies inside Supabase...');
    const { stdout, stderr } = await executeCommand(conn, `docker exec ${dbContainer} psql -U supabase_admin -d postgres -f /tmp/storage_rls_policies.sql`);
    console.log('STDOUT:');
    console.log(stdout);
    console.log('STDERR:');
    console.log(stderr);

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

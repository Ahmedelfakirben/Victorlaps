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
  console.log('📡 SSH Connected to VPS 46.224.62.53');
  try {
    const dbContainer = 'supabase-db-cw0o08g4gwokc4cgss840kcg';
    const sql = `
      INSERT INTO storage.buckets (id, name, public) VALUES
      ('vehicles', 'vehicles', true),
      ('documents', 'documents', true),
      ('clients', 'clients', true),
      ('temp', 'temp', true),
      ('storefront_assets', 'storefront_assets', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log('Creating storage buckets inside Supabase database...');
    const { stdout, stderr } = await executeCommand(conn, `docker exec ${dbContainer} psql -U supabase_admin -d postgres -c "${sql.replace(/\n/g, ' ')}"`);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);

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

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
      ALTER TABLE public.vehicles ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.clients ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.contracts ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.transactions ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.invoices ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.maintenance ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.vehicle_documents ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.branches ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.fines ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.pricing_rules ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
      ALTER TABLE public.vehicle_damage_photos ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
    `;

    console.log('Altering tables to set company_id defaults...');
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

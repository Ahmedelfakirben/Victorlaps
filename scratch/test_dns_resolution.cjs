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
    const { stdout: dockerPs } = await executeCommand(conn, 'docker ps --format "{{.Names}}"');
    const names = dockerPs.trim().split('\n');
    const appContainerName = names.find(n => n.startsWith('q0sw'));
    if (!appContainerName) {
      console.log('❌ App container not found');
      return;
    }

    console.log(`\n🔍 Found active container: ${appContainerName}`);
    
    const testScript = `
const { Client } = require('pg');
const urls = [
  'postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres',
  'postgresql://postgres:postgres@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres'
];

async function test() {
  for (const url of urls) {
    console.log('Testing:', url.replace(/:[^:@]+@/, ':***@'));
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      console.log('✅ Success!');
      const res = await client.query('SELECT count(*) FROM public.mail_queue');
      console.log('Mail queue count:', res.rows[0].count);
      await client.end();
      return;
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
  }
}
test();
`;
    await executeCommand(conn, `echo '${testScript.replace(/'/g, "'\\''")}' > /tmp/test_db_conn.cjs`);
    await executeCommand(conn, `docker cp /tmp/test_db_conn.cjs ${appContainerName}:/app/test_db_conn.cjs`);
    
    console.log('Running test script in container...');
    const { stdout, stderr } = await executeCommand(conn, `docker exec -w /app ${appContainerName} node /app/test_db_conn.cjs`);
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

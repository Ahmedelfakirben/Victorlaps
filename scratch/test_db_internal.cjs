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
    const appContainer = 'q0sw04ccg04088ggog0ggogo-214737332288';
    
    // We will run a command inside the app container to ping or query the DB using node!
    console.log('\n--- Testing internal DB connection using node inside app container ---');
    
    // Let's write a temporary script inside the app container
    const script = `
const { Client } = require('pg');
const urls = [
  'postgresql://postgres:postgres@supabase-db:5432/postgres',
  'postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@supabase-db:5432/postgres',
  'postgresql://postgres:postgres@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres',
  'postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres'
];

async function test() {
  for (const url of urls) {
    console.log('Testing URL:', url.replace(/:[^:@]+@/, ':***@'));
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      console.log('✅ Success!');
      const res = await client.query('SELECT now()');
      console.log('Time:', res.rows[0]);
      await client.end();
      return;
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
  }
}
test();
`;

    // Write it to a file in the container
    await executeCommand(conn, `docker exec ${appContainer} node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);

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

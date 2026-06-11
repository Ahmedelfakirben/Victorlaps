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
    
    // Write test script file on the host
    console.log('Writing test script file inside container...');
    const testScript = `
const { Client } = require('pg');
const urls = [
  'postgresql://postgres:postgres@supabase-db:5432/postgres',
  'postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@supabase-db:5432/postgres',
  'postgresql://postgres:postgres@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres',
  'postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@supabase-db-cw0o08g4gwokc4cgss840kcg:5432/postgres'
];

async function test() {
  for (const url of urls) {
    console.log('Testing:', url.replace(/:[^:@]+@/, ':***@'));
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
    // Create it on VPS host first
    await executeCommand(conn, `echo '${testScript.replace(/'/g, "'\\''")}' > /tmp/test_db.js`);
    // Copy into container
    await executeCommand(conn, `docker cp /tmp/test_db.js ${appContainer}:/tmp/test_db.js`);
    // Run it in container
    console.log('Running test script in container...');
    const { stdout, stderr } = await executeCommand(conn, `docker exec ${appContainer} node /tmp/test_db.js`);
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

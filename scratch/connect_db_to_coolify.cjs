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
    const networkName = 'coolify';

    console.log(`Connecting database container ${dbContainer} to network ${networkName}...`);
    const { stdout: connectRes, stderr: connectErr } = await executeCommand(conn, `docker network connect ${networkName} ${dbContainer}`);
    console.log('STDOUT:', connectRes);
    console.log('STDERR:', connectErr);

    console.log('\n🔍 Inspecting networks for database container:');
    const { stdout: dbNet } = await executeCommand(conn, `docker inspect --format '{{json .NetworkSettings.Networks}}' ${dbContainer}`);
    console.log(dbNet);

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

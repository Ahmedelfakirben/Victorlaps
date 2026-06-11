const { Client } = require('ssh2');

const SSH_HOST = '46.224.62.53';
const SSH_USER = 'root';
const SSH_PASSWORD = 'satec2016'; // Let's try the same password first

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
    console.log('--- DOCKER CONTAINERS ---');
    const { stdout: dockerPs } = await executeCommand(conn, 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"');
    console.log(dockerPs);

    console.log('--- ALL CONTAINERS (INCLUDING STOPPED) ---');
    const { stdout: dockerPsAll } = await executeCommand(conn, 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"');
    console.log(dockerPsAll);

  } catch (err) {
    console.error('Error executing commands:', err.message);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('SSH Connection Error on 46.224.62.53:', err.message);
}).connect({
  host: SSH_HOST,
  port: 22,
  username: SSH_USER,
  password: SSH_PASSWORD
});

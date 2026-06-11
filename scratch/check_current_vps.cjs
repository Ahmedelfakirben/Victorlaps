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
    console.log('--- Running Containers ---');
    console.log(dockerPs.trim());
    
    // Find the container starting with q0sw
    const names = dockerPs.trim().split('\n');
    const appContainerName = names.find(n => n.startsWith('q0sw'));
    if (appContainerName) {
      console.log(`\n🔍 Found new app container: ${appContainerName}`);
      const { stdout: appNet } = await executeCommand(conn, `docker inspect ${appContainerName}`);
      const data = JSON.parse(appNet);
      console.log('--- Network Settings ---');
      console.log(JSON.stringify(data[0].NetworkSettings.Networks, null, 2));
    } else {
      console.log('❌ App container not found');
    }

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

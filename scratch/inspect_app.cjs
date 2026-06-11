const { Client } = require('ssh2');

const SSH_HOST = '49.13.52.159';
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
    const containerName = 'sz4pb823vvw2xjp3ddh546hs-143757048457';
    console.log(`\n🔍 Checking files in container: ${containerName}`);
    
    const { stdout: files } = await executeCommand(conn, `docker exec ${containerName} ls -la`);
    console.log('--- Files ---');
    console.log(files);

    const { stdout: processes } = await executeCommand(conn, `docker exec ${containerName} ps aux`);
    console.log('--- Processes ---');
    console.log(processes);

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

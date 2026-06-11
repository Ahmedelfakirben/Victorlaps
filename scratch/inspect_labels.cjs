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
    const containers = [
      'm16dhw9x5mtt0ibhd3v9ay2h-145456754429',
      'sz4pb823vvw2xjp3ddh546hs-143757048457'
    ];

    for (const name of containers) {
      console.log(`\n================ INSPECTING CONTAINER: ${name} ================`);
      const { stdout: labels } = await executeCommand(conn, `docker inspect --format '{{range $k, $v := .Config.Labels}}{{println $k "=" $v}}{{end}}' ${name}`);
      console.log('--- LABELS ---');
      console.log(labels.trim());
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

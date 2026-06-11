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
      'er6ku3cmb3b4cn03zktuh81d-135139798239',
      'os1fts69rk2y3eew2dht1z2m-130241148617',
      'bwc7s06307g17m7ceue4ksag-223114361533'
    ];

    for (const name of containers) {
      console.log(`\n================ INSPECTING CONTAINER: ${name} ================`);
      const { stdout: labels } = await executeCommand(conn, `docker inspect --format '{{range $k, $v := .Config.Labels}}{{println $k "=" $v}}{{end}}' ${name}`);
      console.log('--- LABELS ---');
      console.log(labels.trim());
      
      const { stdout: env } = await executeCommand(conn, `docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' ${name}`);
      console.log('--- ENV ---');
      const lines = env.trim().split('\n');
      for (const line of lines) {
        if (line.includes('VITE_') || line.includes('PORT') || line.includes('SMTP') || line.includes('DATABASE_URL') || line.includes('NODE_ENV')) {
          console.log(line);
        }
      }
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

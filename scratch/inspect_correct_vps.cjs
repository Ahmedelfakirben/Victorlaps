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
    const name = 'q0sw04ccg04088ggog0ggogo-162833441575';
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

    const { stdout: cmd } = await executeCommand(conn, `docker inspect --format '{{.Config.Cmd}}' ${name}`);
    console.log('--- CMD ---', cmd.trim());

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

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
    const appContainer = 'q0sw04ccg04088ggog0ggogo-162833441575';

    console.log(`\n🔍 Inspecting networks for: ${dbContainer}`);
    const { stdout: dbNet } = await executeCommand(conn, `docker inspect --format '{{json .NetworkSettings.Networks}}' ${dbContainer}`);
    console.log(dbNet);

    console.log(`\n🔍 Inspecting networks for: ${appContainer}`);
    const { stdout: appNet } = await executeCommand(conn, `docker inspect --format '{{json .NetworkSettings.Networks}}' ${appContainer}`);
    console.log(appNet);

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

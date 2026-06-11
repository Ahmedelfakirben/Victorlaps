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
    console.log('--- SHOWING ALL EXPOSED PORTS ---');
    const { stdout: netstat } = await executeCommand(conn, 'netstat -tulpn | grep -E "5432|3000|8000"');
    console.log(netstat);

    console.log('--- DOCKER NETWORK CONNECT ---');
    // Connect the app container to the database network so they can talk directly!
    // Database network name: cw0o08g4gwokc4cgss840kcg
    // App container name: q0sw04ccg04088ggog0ggogo-214737332288
    const appContainer = 'q0sw04ccg04088ggog0ggogo-214737332288';
    const dbNetwork = 'cw0o08g4gwokc4cgss840kcg';
    console.log(`Connecting container ${appContainer} to network ${dbNetwork}...`);
    const { stdout: connectRes, stderr: connectErr } = await executeCommand(conn, `docker network connect ${dbNetwork} ${appContainer}`);
    console.log('STDOUT:', connectRes);
    console.log('STDERR:', connectErr);

    console.log('--- AFTER CONNECT: APP CONTAINER NETWORKS ---');
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

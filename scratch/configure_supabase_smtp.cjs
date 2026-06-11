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
  console.log('📡 SSH Connected to VPS');
  try {
    const serviceDir = '/data/coolify/services/cw0o08g4gwokc4cgss840kcg';
    const envFile = `${serviceDir}/.env`;

    console.log('Modifying .env file on VPS...');
    const commands = [
      `sed -i 's/^SMTP_ADMIN_EMAIL=.*/SMTP_ADMIN_EMAIL=admin@sigma-di.ma/g' ${envFile}`,
      `sed -i 's/^SMTP_HOST=.*/SMTP_HOST=smtp.office365.com/g' ${envFile}`,
      `sed -i 's/^SMTP_PASS=.*/SMTP_PASS=bhktvtjjdhtdgwkt/g' ${envFile}`,
      `sed -i 's/^SMTP_PORT=.*/SMTP_PORT=587/g' ${envFile}`,
      `sed -i 's/^SMTP_SENDER_NAME=.*/SMTP_SENDER_NAME=VEKTORLAPS/g' ${envFile}`,
      `sed -i 's/^SMTP_USER=.*/SMTP_USER=admin@sigma-di.ma/g' ${envFile}`
    ];

    for (const cmd of commands) {
      await executeCommand(conn, cmd);
    }
    console.log('env file updated successfully!');

    // Read it back to verify
    const { stdout: verifyStdout } = await executeCommand(conn, `grep -i "smtp_" ${envFile}`);
    console.log('Updated SMTP configs:\n', verifyStdout);

    console.log('Restarting Supabase Auth container to apply changes...');
    // We can just restart the supabase-auth container to load the new env variables
    const restartCmd = `cd ${serviceDir} && docker compose down && docker compose up -d`;
    console.log('Executing restart command:', restartCmd);
    const { stdout: restartOut, stderr: restartErr } = await executeCommand(conn, restartCmd);
    console.log('Restart STDOUT:', restartOut);
    console.log('Restart STDERR:', restartErr);

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

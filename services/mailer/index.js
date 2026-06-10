const { Client } = require('pg');
const nodemailer = require('nodemailer');

// Conexión a la base de datos desde variables de entorno
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Falta la variable de entorno DATABASE_URL");
  process.exit(1);
}

const pgClient = new Client({ connectionString });

// Conexión SMTP desde variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

async function sendPendingEmails() {
  try {
    const res = await pgClient.query("SELECT * FROM public.mail_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10");
    const emails = res.rows;

    for (const email of emails) {
      console.log(`Intentando enviar correo a ${email.to_email}...`);
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email.to_email,
          subject: email.subject,
          text: email.body_text,
          html: email.body_html
        });
        
        console.log(`Enviado: ${info.messageId}`);
        await pgClient.query("UPDATE public.mail_queue SET status = 'sent' WHERE id = $1", [email.id]);
        
      } catch (sendError) {
        console.error(`Error enviando correo a ${email.to_email}:`, sendError.message);
        await pgClient.query("UPDATE public.mail_queue SET status = 'error', error_log = $1 WHERE id = $2", [sendError.message, email.id]);
      }
    }
  } catch (err) {
    console.error("Error consultando mail_queue:", err.message);
  }
}

async function start() {
  try {
    await pgClient.connect();
    console.log("Conectado a PostgreSQL. Escuchando cola de correos...");
    
    // Polling cada 10 segundos
    setInterval(sendPendingEmails, 10000);
    // Ejecutar la primera vez de inmediato
    sendPendingEmails();
  } catch (err) {
    console.error("Error conectando a la BD:", err.message);
    process.exit(1);
  }
}

start();

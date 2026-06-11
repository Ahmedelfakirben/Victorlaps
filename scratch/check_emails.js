const { Client } = require('pg');
const client = new Client('postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@46.224.62.53:5432/postgres');

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    console.log('--- Ultimas 5 empresas ---');
    const companies = await client.query("SELECT id, name, status, admin_email, email FROM public.companies ORDER BY created_at DESC LIMIT 5");
    console.log(companies.rows);
    
    console.log('--- Ultimos 5 emails en la cola ---');
    const queue = await client.query("SELECT id, to_email, subject, status, error_log, created_at FROM public.mail_queue ORDER BY created_at DESC LIMIT 5");
    console.log(queue.rows);

    console.log('--- Triggers en la tabla public.companies ---');
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement 
      FROM information_schema.triggers 
      WHERE event_object_table = 'companies'
    `);
    console.log(triggers.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();

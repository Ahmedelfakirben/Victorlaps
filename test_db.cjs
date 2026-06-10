const { Client } = require('pg');
const client = new Client('postgresql://postgres:9q25ZYhJObskCtrCJ1hMWaEos38n9RPx@46.224.62.53:5432/postgres');

client.connect()
  .then(() => {
    console.log('Connected to DB');
    return client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  })
  .then(res => {
    console.log('Tables in public schema:');
    console.log(res.rows.map(r => r.table_name).join(', '));
  })
  .catch(err => {
    console.error('DB Error:', err);
  })
  .finally(() => {
    client.end();
  });

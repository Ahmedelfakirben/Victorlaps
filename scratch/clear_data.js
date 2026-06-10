import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // Comando SQL para vaciar las tablas operativas respetando las relaciones
  const sql = `
    TRUNCATE TABLE 
      public.contracts, 
      public.vehicles, 
      public.vehicle_documents, 
      public.vehicle_damage_photos, 
      public.maintenance, 
      public.clients, 
      public.transactions, 
      public.invoices, 
      public.fines, 
      public.incidents 
    CASCADE;
  `;
  
  console.log('🧹 Conectado. Ejecutando limpieza de datos operativos en el VPS...');

  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${sql}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- RESULTADO DE LA LIMPIEZA ---');
      console.log('Exit Code:', code);
      if (code === 0) {
        console.log('🎉 ¡Limpieza realizada con éxito!');
        console.log('Se han vaciado todos los coches, contratos, clientes y facturas antiguas.');
        console.log('Los usuarios de autenticación y perfiles de acceso se han conservado intactos.');
      } else {
        console.error('❌ Error al realizar la limpieza:');
        console.error(stderr);
      }
      console.log('---------------------------------');
      conn.end();
    }).on('data', (data) => {
      stdout += data;
    }).stderr.on('data', (data) => {
      stderr += data;
    });
  });
}).connect({
  host: '49.13.52.159',
  port: 22,
  username: 'root',
  password: 'satec2016'
});

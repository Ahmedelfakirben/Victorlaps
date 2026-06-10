import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  // SQL para crear el disparador (trigger) en la tabla auth.users para automatizar perfiles
  const sql = `
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;
  
  console.log('⚡ Conectado. Creando el trigger on_auth_user_created en el VPS...');

  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c "${sql}"`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('\n--- RESULTADO DE LA CREACIÓN DEL TRIGGER ---');
      console.log('Exit Code:', code);
      if (code === 0) {
        console.log('🎉 ¡Trigger on_auth_user_created creado con éxito!');
        console.log('Los nuevos registros de usuarios ahora autogenerarán su perfil en public.profiles automáticamente.');
      } else {
        console.error('❌ Error al crear el trigger:');
        console.error(stderr || stdout);
      }
      console.log('---------------------------------------------');
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

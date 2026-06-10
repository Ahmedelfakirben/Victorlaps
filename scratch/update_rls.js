import { Client } from 'ssh2';

const sql = `
DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
CREATE POLICY "Auth can manage contracts" ON public.contracts FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Auth can manage transactions" ON public.transactions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Auth can manage invoices" ON public.invoices FOR ALL TO authenticated USING (true);
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`docker exec supabase-db-qxcax1lm4sxvwiyox2b3qn6n psql -U supabase_admin -d postgres -c '${sql}'`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', (code) => {
      console.log('--- UPDATE RLS ---');
      console.log('Exit Code:', code);
      console.log('Stdout:', stdout);
      console.log('Stderr:', stderr);
      console.log('----------------------');
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

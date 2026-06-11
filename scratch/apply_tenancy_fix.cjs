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
    const dbContainer = 'supabase-db-cw0o08g4gwokc4cgss840kcg';
    const sql = `
-- 1. Redefine register_agency to support email lookup
CREATE OR REPLACE FUNCTION public.register_agency(
  admin_email TEXT,
  agency_name TEXT
) RETURNS JSON AS $$
DECLARE
  new_company_id UUID;
  new_user_id UUID;
BEGIN
  new_user_id := auth.uid();
  
  IF new_user_id IS NULL THEN
    SELECT id INTO new_user_id FROM auth.users WHERE email = admin_email;
  END IF;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email %', admin_email;
  END IF;

  INSERT INTO public.companies (name, status, trial_ends_at, admin_email, email)
  VALUES (agency_name, 'trial', NOW() + INTERVAL '3 days', admin_email, admin_email)
  RETURNING id INTO new_company_id;

  UPDATE public.profiles 
  SET company_id = new_company_id, role = 'admin'
  WHERE id = new_user_id;

  INSERT INTO public.pricing_rules (company_id, season_name, season_name_ar, start_month, start_day, end_month, end_day, multiplier) VALUES
    (new_company_id, 'Haute Saison (Été)', 'الموسم المرتفع (صيف)', 6, 1, 9, 30, 1.50),
    (new_company_id, 'Basse Saison (Hiver)', 'الموسم المنخفض (شتاء)', 11, 1, 2, 28, 0.80),
    (new_company_id, 'Saison Normale', 'الموسم العادي', 3, 1, 5, 31, 1.00);

  RETURN json_build_object('success', true, 'company_id', new_company_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine public storefront view to target anon role instead of public
DROP POLICY IF EXISTS "Public storefront view" ON public.companies;
CREATE POLICY "Public storefront view" ON public.companies 
FOR SELECT 
TO anon 
USING (status IN ('active', 'trial'));

-- 3. Redefine public vehicles view to target anon role instead of public
DROP POLICY IF EXISTS "Public vehicles view" ON public.vehicles;
CREATE POLICY "Public vehicles view" ON public.vehicles 
FOR SELECT 
TO anon 
USING (
  status = 'available' 
  AND EXISTS (
    SELECT 1 FROM public.companies 
    WHERE public.companies.id = vehicles.company_id 
    AND public.companies.status IN ('active', 'trial')
  )
);
`;

    console.log('Writing SQL file to VPS...');
    // We escape backticks or other things if needed, but here we use single quotes EOF to prevent interpretation
    const writeCmd = `cat << 'EOF' > /tmp/fix_tenancy.sql\n${sql}\nEOF`;
    await executeCommand(conn, writeCmd);
    console.log('SQL file written successfully. Executing inside database...');

    const execCmd = `docker exec -i ${dbContainer} psql -U supabase_admin -d postgres < /tmp/fix_tenancy.sql`;
    const { stdout, stderr } = await executeCommand(conn, execCmd);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);

    // Clean up
    await executeCommand(conn, 'rm /tmp/fix_tenancy.sql');

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

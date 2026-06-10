import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://supabasekong-cw0o08g4gwokc4cgss840kcg.46.224.62.53.sslip.io:8000';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MTAxODQ2MCwiZXhwIjo0OTM2NjkyMDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.KK8Hy4yqztG1SN4mF909-Wv315YgI2SzpSCDbZIxHHw'; // SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Creating SuperAdmin user...');
  
  // 1. Create User
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: 'admin@vektorlaps.com',
    password: 'SuperPassword123!',
    email_confirm: true,
    user_metadata: { full_name: 'Vektorlaps Admin', role: 'superadmin' }
  });

  if (authErr) {
    console.error('Error creating auth user:', authErr.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Auth user created:', userId);

  // 2. The trigger `handle_new_user` might have created a profile with role='admin'. 
  // Let's update it to 'superadmin' just to be sure.
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('id', userId);

  if (profileErr) {
    console.error('Error updating profile role:', profileErr.message);
  } else {
    console.log('Profile updated to superadmin!');
  }
}

main();

UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@vektorlaps.com';
UPDATE public.profiles SET role = 'superadmin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@vektorlaps.com');

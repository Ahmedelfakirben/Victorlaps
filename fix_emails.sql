-- Fix the trigger so new users always have their email saved in companies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'admin', new.raw_user_meta_data->>'full_name');

  -- Create company
  INSERT INTO public.companies (id, name, status, subscription_plan, admin_email, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'company_name',
    'trial',
    'standard',
    new.email,
    new.email
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill missing emails for existing companies
UPDATE public.companies c
SET 
  email = u.email,
  admin_email = u.email
FROM auth.users u
WHERE c.id = u.id AND (c.email IS NULL OR c.admin_email IS NULL);

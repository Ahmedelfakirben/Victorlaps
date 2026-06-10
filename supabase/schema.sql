-- ============================================
-- VEKTORLAPS SAAS — Supabase Schema (Multi-Tenant)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. COMPANIES (Tenants / Agencies)
-- ============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  ice TEXT,
  tva_default_rate NUMERIC(5,2) DEFAULT 20.00,
  currency TEXT DEFAULT 'MAD',
  logo_url TEXT,
  default_contract_terms TEXT,
  invoice_prefix TEXT DEFAULT 'FAC-',
  
  -- SaaS Subscription Fields
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'expired')),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. PROFILES (linked to auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  full_name_ar TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'employee')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup (handled manually or via trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Nota: Para SaaS, la creación de la compañía y el enlace al perfil 
  -- se debe manejar desde el frontend en una transacción o RPC para mayor control.
  -- Este trigger es un fallback básico.
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. VEHICLES
-- ============================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,          -- Matricule
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  fuel TEXT NOT NULL DEFAULT 'Diesel' CHECK (fuel IN ('Diesel', 'Essence', 'Hybride', 'Électrique')),
  color TEXT,
  seats INT DEFAULT 5,
  transmission TEXT DEFAULT 'Manuelle' CHECK (transmission IN ('Manuelle', 'Automatique')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'blocked')),
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_km INT DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, plate) -- Each company must have unique plates
);

-- ============================================
-- 4. VEHICLE DOCUMENTS
-- ============================================
CREATE TABLE public.vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('carte_grise', 'assurance', 'visite_technique')),
  doc_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. MAINTENANCE
-- ============================================
CREATE TABLE public.maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('oil_change', 'tires', 'brakes', 'general', 'other')),
  description TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  km_at_service INT,
  performed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  next_due_km INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. CLIENTS (CRM)
-- ============================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  phone TEXT,
  email TEXT,
  cin TEXT,
  passport TEXT,
  driver_license TEXT,
  nationality TEXT DEFAULT 'Marocaine',
  address TEXT,
  foreign_address TEXT,
  birth_date DATE,
  birth_place TEXT,
  license_date DATE,
  is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
  blacklist_reason TEXT,
  is_vip BOOLEAN NOT NULL DEFAULT FALSE,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  total_rentals INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  cin_scan_url TEXT,
  license_scan_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, cin)
);

-- ============================================
-- 7. CONTRACTS
-- ============================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  created_by UUID REFERENCES public.profiles(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,

  daily_rate NUMERIC(10,2) NOT NULL,
  total_days INT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tva_rate NUMERIC(5,2) DEFAULT 20.00,
  tva_amount NUMERIC(10,2) DEFAULT 0,
  total_ttc NUMERIC(12,2) NOT NULL,
  deposit_amount NUMERIC(10,2) DEFAULT 0,
  deposit_returned BOOLEAN DEFAULT FALSE,

  fuel_level_out TEXT CHECK (fuel_level_out IN ('empty', '1/4', '1/2', '3/4', 'full')),
  fuel_level_in TEXT CHECK (fuel_level_in IN ('empty', '1/4', '1/2', '3/4', 'full')),
  km_out INT,
  km_in INT,
  cleanliness_out TEXT CHECK (cleanliness_out IN ('clean', 'acceptable', 'dirty')),
  cleanliness_in TEXT CHECK (cleanliness_in IN ('clean', 'acceptable', 'dirty')),
  time_out TEXT DEFAULT '10:00',
  time_in TEXT DEFAULT '20:00',
  actual_return_time TEXT,
  second_driver_name TEXT,
  second_driver_birth TEXT,
  second_driver_address TEXT,
  second_driver_license TEXT,
  second_driver_license_date DATE,

  contract_language TEXT DEFAULT 'fr' CHECK (contract_language IN ('fr', 'ar', 'en', 'es')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'overdue')),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, contract_number)
);

-- ============================================
-- 8. VEHICLE DAMAGE PHOTOS
-- ============================================
CREATE TABLE public.vehicle_damage_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('check_in', 'check_out')),
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. TRANSACTIONS
-- ============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  tva_amount NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')),
  
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES public.profiles(id),
  
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. INVOICES
-- ============================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  
  amount_ht NUMERIC(12,2) NOT NULL,
  tva_rate NUMERIC(5,2) DEFAULT 20.00,
  tva_amount NUMERIC(10,2) NOT NULL,
  amount_ttc NUMERIC(12,2) NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT,
  payment_date DATE,
  
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, invoice_number)
);

-- ============================================
-- 11. FINES
-- ============================================
CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  fine_date DATE NOT NULL,
  fine_type TEXT NOT NULL,
  plate TEXT,
  amount NUMERIC(10,2) NOT NULL,
  reference TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'charged', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 12. PRICING RULES
-- ============================================
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  season_name TEXT NOT NULL,
  season_name_ar TEXT,
  start_month INT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  start_day INT NOT NULL CHECK (start_day BETWEEN 1 AND 31),
  end_month INT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
  end_day INT NOT NULL CHECK (end_day BETWEEN 1 AND 31),
  multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANCY
-- ============================================

-- Function to get the current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if current user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_damage_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- COMPANIES POLICIES
CREATE POLICY "Superadmins can manage all companies" ON public.companies FOR ALL TO authenticated USING (is_superadmin());
CREATE POLICY "Users can read own company" ON public.companies FOR SELECT TO authenticated USING (id = get_user_company_id());
CREATE POLICY "Admins can update own company" ON public.companies FOR UPDATE TO authenticated USING (id = get_user_company_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- PROFILES POLICIES
CREATE POLICY "Superadmins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (is_superadmin());
CREATE POLICY "Users can view profiles in their company" ON public.profiles FOR SELECT TO authenticated USING (company_id = get_user_company_id() OR id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can manage profiles in their company" ON public.profiles FOR ALL TO authenticated USING (company_id = get_user_company_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- GENERAL SAAS POLICIES FOR ALL ENTITIES (Users see/manage only their company's data)
-- For simplicity, we apply a consistent policy to all multi-tenant tables.
CREATE OR REPLACE FUNCTION apply_tenant_policies(table_name TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE POLICY "Superadmins have full access" ON %I FOR ALL TO authenticated USING (public.is_superadmin())', table_name);
  EXECUTE format('CREATE POLICY "Users have access to own company data" ON %I FOR ALL TO authenticated USING (company_id = public.get_user_company_id())', table_name);
END;
$$ LANGUAGE plpgsql;

SELECT apply_tenant_policies('vehicles');
SELECT apply_tenant_policies('vehicle_documents');
SELECT apply_tenant_policies('maintenance');
SELECT apply_tenant_policies('vehicle_damage_photos');
SELECT apply_tenant_policies('clients');
SELECT apply_tenant_policies('contracts');
SELECT apply_tenant_policies('transactions');
SELECT apply_tenant_policies('invoices');
SELECT apply_tenant_policies('fines');
SELECT apply_tenant_policies('pricing_rules');

-- ============================================
-- ONBOARDING RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.register_agency(
  admin_email TEXT,
  agency_name TEXT
) RETURNS JSON AS $$
DECLARE
  new_company_id UUID;
  new_user_id UUID;
BEGIN
  -- We assume the auth.user is already created and this is called by the user themselves right after sign up,
  -- or we pass auth.uid() directly.
  new_user_id := auth.uid();
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create company with 3 days trial and save email fields
  INSERT INTO public.companies (name, status, trial_ends_at, admin_email, email)
  VALUES (agency_name, 'trial', NOW() + INTERVAL '3 days', admin_email, admin_email)
  RETURNING id INTO new_company_id;

  -- Update profile (which was auto-created by trigger)
  UPDATE public.profiles 
  SET company_id = new_company_id, role = 'admin'
  WHERE id = new_user_id;

  -- Create default pricing rules for the new company
  INSERT INTO public.pricing_rules (company_id, season_name, season_name_ar, start_month, start_day, end_month, end_day, multiplier) VALUES
    (new_company_id, 'Haute Saison (Été)', 'الموسم المرتفع (صيف)', 6, 1, 9, 30, 1.50),
    (new_company_id, 'Basse Saison (Hiver)', 'الموسم المنخفض (شتاء)', 11, 1, 2, 28, 0.80),
    (new_company_id, 'Saison Normale', 'الموسم العادي', 3, 1, 5, 31, 1.00);

  RETURN json_build_object('success', true, 'company_id', new_company_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

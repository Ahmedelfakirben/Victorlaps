-- ==========================================================
-- 1. ALTER COMPANIES TABLE (Settings & Subscription)
-- ==========================================================
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS daily_mileage_limit TEXT DEFAULT 'Ilimitado',
ADD COLUMN IF NOT EXISTS fuel_policy TEXT DEFAULT 'Lleno a Lleno',
ADD COLUMN IF NOT EXISTS late_fee_per_hour NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS default_deposit NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS send_reminders BOOLEAN DEFAULT false;

-- Add subscription fields if they don't exist yet
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS mrr NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS storage_used_mb NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS admin_email TEXT;


-- ==========================================================
-- 2. CREATE MAIL QUEUE TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.mail_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, error
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL
);

-- RLS para mail_queue (El superadmin puede ver todo, el usuario no la necesita, es interna)
ALTER TABLE public.mail_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin can manage mail queue" ON public.mail_queue
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
);

-- ==========================================================
-- 3. CREATE CONTACT MESSAGES TABLE (Landing Page)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- new, read, replied
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para contact_messages (Cualquiera puede insertar, solo superadmin puede leer/actualizar)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact message" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Superadmin can manage contact messages" ON public.contact_messages
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
);


-- ==========================================================
-- 4. TRIGGERS FOR AUTOMATIC EMAILS
-- ==========================================================

-- Trigger: Email de confirmación al registrarse
CREATE OR REPLACE FUNCTION public.queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.mail_queue (to_email, subject, body_html, company_id)
    VALUES (
        NEW.admin_email,
        '¡Bienvenido a 201M Rent Car! Has iniciado tu prueba',
        '<p>Hola,</p><p>Gracias por registrar tu agencia <b>' || NEW.name || '</b>.</p><p>Has iniciado tu período de prueba. Si tienes alguna duda, responde a este correo.</p>',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_queue_welcome_email ON public.companies;
CREATE TRIGGER trigger_queue_welcome_email
AFTER INSERT ON public.companies
FOR EACH ROW
WHEN (NEW.admin_email IS NOT NULL)
EXECUTE FUNCTION public.queue_welcome_email();

-- Trigger: Email de confirmación de activación (cuando status cambia a active)
CREATE OR REPLACE FUNCTION public.queue_activation_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.admin_email IS NOT NULL THEN
        INSERT INTO public.mail_queue (to_email, subject, body_html, company_id)
        VALUES (
            NEW.admin_email,
            '¡Tu cuenta ha sido activada!',
            '<p>Hola,</p><p>Te informamos que tu suscripción para <b>' || NEW.name || '</b> está ahora <b>ACTIVA</b>. Gracias por confiar en nosotros.</p>',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_queue_activation_email ON public.companies;
CREATE TRIGGER trigger_queue_activation_email
AFTER UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.queue_activation_email();

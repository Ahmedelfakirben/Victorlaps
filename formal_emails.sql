-- ==========================================================
-- 1. Update/Create register_agency function with 3 days trial & email storage
-- ==========================================================
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


-- ==========================================================
-- 2. Trigger Function for Trial Activation (Welcome Email)
-- ==========================================================
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_html TEXT;
BEGIN
  -- Get email from companies or fallback to auth.users / profiles
  v_email := COALESCE(NEW.admin_email, NEW.email);
  IF v_email IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  END IF;
  
  v_name := COALESCE(NEW.name, 'Client');

  v_html := '
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background-color: #111111; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px;">VEKTORLAPS SAS</h1>
      </div>
      <div style="padding: 40px 30px; color: #333333;">
        <h2 style="margin-top: 0; color: #111111;">Bienvenue dans votre Période d''Essai, ' || v_name || '</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nous vous remercions de faire confiance à <strong>Vektorlaps SAS</strong>. Votre compte a été créé avec succès et votre période d''essai gratuite de <strong>3 jours</strong> a officiellement commencé.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Détails de l''Abonnement :</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
            <li><strong>Plan :</strong> Essai Gratuit (3 jours)</li>
            <li><strong>Accès :</strong> Fonctionnalités complètes</li>
            <li><strong>Statut :</strong> Actif</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="https://victorlaps.elfakir.com/login" style="background-color: #d4af37; color: #111111; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accéder à mon tableau de bord</a>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <h4 style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Conditions d''Utilisation de l''Essai</h4>
          <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 0; text-align: justify;">
            L''utilisation de la plateforme Vektorlaps SAS pendant la période d''essai de 3 jours est soumise à nos conditions de service. Cette période est strictement destinée à l''évaluation du logiciel. Vektorlaps SAS se réserve le droit de suspendre tout compte en cas d''utilisation abusive ou de violation des conditions (spam, activités illicites, etc.). Aucune donnée de carte de crédit n''est requise pour l''essai. À la fin de la période de 3 jours, l''accès sera restreint jusqu''à la souscription à un abonnement premium.
          </p>
        </div>
      </div>
      <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
        &copy; ' || extract(year from current_date) || ' Vektorlaps SAS. Tous droits réservés.
      </div>
    </div>
  </body>
  </html>
  ';

  -- Insert into mail queue
  IF v_email IS NOT NULL THEN
    INSERT INTO mail_queue (to_email, subject, body_html, company_id)
    VALUES (v_email, 'Activation de votre période d''essai (3 Jours) - Vektorlaps SAS', v_html, NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================================
-- 3. Trigger Function for Account Activation / Suspension (Status Updates)
-- ==========================================================
CREATE OR REPLACE FUNCTION notify_company_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_html TEXT;
  v_subject TEXT;
BEGIN
  -- Only trigger if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Try to get the email address
    v_email := COALESCE(NEW.admin_email, NEW.email);
    IF v_email IS NULL THEN
      SELECT email INTO v_email FROM public.profiles WHERE company_id = NEW.id AND role = 'admin' LIMIT 1;
    END IF;
    IF v_email IS NULL THEN
      SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    END IF;

    v_name := COALESCE(NEW.name, 'Client');

    -- Check new status
    IF NEW.status = 'active' THEN
      v_subject := 'Votre compte Vektorlaps SAS est désormais Actif 🎉';
      v_html := '
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #111111; padding: 30px; text-align: center;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px; letter-spacing: 2px;">COMPTE ACTIVÉ</h1>
          </div>
          <div style="padding: 40px 30px; color: #333333;">
            <h2 style="margin-top: 0; color: #111111;">Félicitations ' || v_name || ' !</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nous avons le plaisir de vous informer que votre abonnement a été activé avec succès par notre équipe d''administration. Vous pouvez désormais utiliser Vektorlaps SAS sans aucune restriction.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 10px 0;"><strong>Plan :</strong> ' || COALESCE(NEW.subscription_plan, 'Professionnel') || '</p>
              <p style="margin: 0;"><strong>Statut :</strong> Actif</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://victorlaps.elfakir.com/login" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accéder à mon tableau de bord</a>
            </div>
            
            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <h4 style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Conditions de Publication et d''Utilisation</h4>
              <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 0; text-align: justify;">
                L''activation de votre compte est soumise à nos conditions de service. Vektorlaps SAS se réserve le droit de restreindre l''accès en cas de défaut de paiement ou de non-respect de nos règles communautaires de sécurité. Pour toute question ou assistance technique, veuillez contacter notre support.
              </p>
            </div>
          </div>
          <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; ' || extract(year from current_date) || ' Vektorlaps SAS. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
      ';

    ELSIF NEW.status = 'suspended' THEN
      v_subject := 'Notification de suspension de compte - Vektorlaps SAS ⚠️';
      v_html := '
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">COMPTE SUSPENDU</h1>
          </div>
          <div style="padding: 40px 30px; color: #333333;">
            <h2 style="margin-top: 0; color: #111111;">Bonjour ' || v_name || ',</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nous vous informons que votre compte ou votre abonnement a été temporairement suspendu par notre équipe administrative.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>Raison potentielle :</strong> Défaut de facturation, fin de la période d''essai ou non-respect de nos conditions d''utilisation.</p>
              <p style="margin: 0; color: #991b1b;"><strong>Statut actuel :</strong> Suspendu</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #555555;">Pendant la suspension, l''accès à votre espace de gestion et à votre vitrine de réservation en ligne est restreint. Vos données restent conservées en toute sécurité conformément à notre politique de confidentialité.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="mailto:support@vektorlaps.com" style="background-color: #111111; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Contacter l''Assistance</a>
            </div>
          </div>
          <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; ' || extract(year from current_date) || ' Vektorlaps SAS. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
      ';
    END IF;

    -- Send email if a template and address exist
    IF v_email IS NOT NULL AND v_html IS NOT NULL THEN
      INSERT INTO mail_queue (to_email, subject, body_html, company_id)
      VALUES (v_email, v_subject, v_html, NEW.id);
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================================
-- 4. Trigger Function for Storefront Activation
-- ==========================================================
CREATE OR REPLACE FUNCTION notify_storefront_activation()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_html TEXT;
  v_domain TEXT := 'victorlaps.elfakir.com';
BEGIN
  -- Check if slug just became active (changed to NOT NULL for the first time or updated)
  IF OLD.slug IS DISTINCT FROM NEW.slug AND NEW.slug IS NOT NULL THEN
    
    -- Try to get the email address
    v_email := COALESCE(NEW.admin_email, NEW.email);
    IF v_email IS NULL THEN
      SELECT email INTO v_email FROM public.profiles WHERE company_id = NEW.id AND role = 'admin' LIMIT 1;
    END IF;
    IF v_email IS NULL THEN
      SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    END IF;
    
    v_html := '
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #111111; padding: 30px; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px; letter-spacing: 2px;">VEKTORLAPS SAS</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333;">
          <h2 style="margin-top: 0; color: #111111;">Activation de votre Vitrine Publique</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">Cher(e) <strong>' || COALESCE(NEW.name, 'Partenaire') || '</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nous avons le plaisir de vous informer que la conception de votre site web a été enregistrée et que votre vitrine numérique est désormais <strong>En Ligne</strong> et accessible au grand public.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #475569; font-size: 14px;">Lien officiel de votre site web :</p>
            <a href="https://' || v_domain || '/booking/' || NEW.slug || '" style="color: #3b82f6; font-size: 18px; font-weight: bold; text-decoration: none;">
              https://' || v_domain || '/booking/' || NEW.slug || '
            </a>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <h4 style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Conditions de Publication et Térmes d''Utilisation</h4>
            <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 0; text-align: justify;">
              En publiant votre vitrine sur l''infrastructure de Vektorlaps SAS, vous acceptez de vous conformer aux réglementations en vigueur concernant le commerce électronique et la location de véhicules. Vektorlaps SAS agit uniquement en tant que fournisseur d''infrastructure technologique (SaaS) et n''est en aucun cas responsable du contenu affiché, des transactions financières effectuées via la plateforme, ni des accords conclus entre vous et vos clients finaux. Vous garantissez posséder les droits sur tous les médias (logos, images) téléchargés sur la plateforme. Tout contenu illicite entraînera la suspension immédiate du service.
            </p>
          </div>
        </div>
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ' || extract(year from current_date) || ' Vektorlaps SAS. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
    ';

    IF v_email IS NOT NULL THEN
      INSERT INTO mail_queue (to_email, subject, body_html, company_id)
      VALUES (v_email, 'Votre site web est en ligne ! - Vektorlaps SAS', v_html, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================================
-- 5. Attach Triggers to public.companies Table
-- ==========================================================

-- Trigger A: Welcome / Trial Activation (AFTER INSERT)
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.companies;
DROP TRIGGER IF EXISTS trigger_queue_welcome_email ON public.companies;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- Trigger B: Account Activation / Suspension (AFTER UPDATE OF status)
DROP TRIGGER IF EXISTS trigger_queue_activation_email ON public.companies;
DROP TRIGGER IF EXISTS trigger_notify_company_status_change ON public.companies;
CREATE TRIGGER trigger_notify_company_status_change
  AFTER UPDATE OF status ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION notify_company_status_change();

-- Trigger C: Storefront Activation (AFTER UPDATE OF slug)
DROP TRIGGER IF EXISTS trigger_notify_storefront_activation ON public.companies;
CREATE TRIGGER trigger_notify_storefront_activation
  AFTER UPDATE OF slug ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION notify_storefront_activation();

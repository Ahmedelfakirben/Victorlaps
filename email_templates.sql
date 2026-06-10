CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_html TEXT;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  v_name := COALESCE(NEW.full_name, 'Client');

  v_html := '
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background-color: #111111; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px;">VEKTORLAPS OS</h1>
      </div>
      <div style="padding: 40px 30px; color: #333333;">
        <h2 style="margin-top: 0; color: #111111;">Bienvenue, ' || v_name || '!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nous sommes ravis de vous accueillir sur <strong>Vektorlaps OS</strong>, la plateforme nouvelle génération pour la gestion de votre flotte d''automobiles.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Votre compte est actuellement en cours d''examen. Une fois approuvé, vous aurez un accès complet à toutes nos fonctionnalités premium.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://vektorlaps.com/login" style="background-color: #d4af37; color: #111111; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accéder à mon espace</a>
        </div>
        <p style="font-size: 14px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px;">Si vous avez des questions, répondez simplement à cet e-mail.</p>
      </div>
    </div>
  </body>
  </html>
  ';

  -- Insert into mail queue
  IF v_email IS NOT NULL THEN
    INSERT INTO mail_queue (to_email, subject, body_html)
    VALUES (v_email, 'Bienvenue sur Vektorlaps OS - Votre compte', v_html);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION notify_company_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_html TEXT;
BEGIN
  IF NEW.status != OLD.status AND NEW.status = 'active' THEN
    -- Get owner's email
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
    
    v_html := '
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #111111; padding: 30px; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px; letter-spacing: 2px;">COMPTE ACTIVÉ</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333;">
          <h2 style="margin-top: 0; color: #111111;">Félicitations ' || COALESCE(NEW.name, '') || ' !</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">Votre abonnement a été activé avec succès. Vous pouvez désormais utiliser Vektorlaps OS sans aucune restriction.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0;"><strong>Plan :</strong> ' || COALESCE(NEW.subscription_plan, 'Standard') || '</p>
            <p style="margin: 0;"><strong>Statut :</strong> Actif</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://vektorlaps.com/login" style="background-color: #111111; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accéder à mon tableau de bord</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    ';

    IF v_email IS NOT NULL THEN
      INSERT INTO mail_queue (to_email, subject, body_html)
      VALUES (v_email, 'Votre compte Vektorlaps OS est Actif 🎉', v_html);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

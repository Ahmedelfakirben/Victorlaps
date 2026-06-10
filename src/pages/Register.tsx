import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Building2, User, Mail, Lock, Phone } from 'lucide-react';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 0. Ensure no existing session is interfering
      await supabase.auth.signOut();

      // 1. Register User in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
            company_name: companyName
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (!authData.user) {
        throw new Error("Erreur lors de la création du compte. Vérifiez votre connexion.");
      }

      // 2. Execute RPC to create company and link profile
      // Wait a moment for the profile trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: rpcError } = await supabase.rpc('register_agency', {
        admin_email: email,
        agency_name: companyName
      });

      if (rpcError) throw rpcError;

      // 3. Check session
      if (!authData.session) {
        // If session is null, it means Supabase requires email confirmation
        setError("Compte créé avec succès ! Veuillez vérifier votre boîte mail pour confirmer votre compte avant de vous connecter.");
        // We don't throw an error, we just stop the flow so the user can see the message.
        return;
      }

      // 4. Redirect to Dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container animate-fade-in">
      <div className="register-card">
        
        <div className="register-header">
          <Link to="/" className="register-logo">
            <img src="/logo.svg" alt="VEKTORLAPS" style={{ width: '160px', height: 'auto', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }} />
            <span>VEKTORLAPS</span>
          </Link>
          <h1>Créez votre agence</h1>
          <p>Démarrez votre essai gratuit de 14 jours. Aucune carte de crédit requise.</p>
        </div>

        {error && (
          <div className="register-alert error animate-scale-in">
            {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleRegister}>
          
          <div className="form-group">
            <label>Nom de l'agence</label>
            <div className="input-with-icon">
              <Building2 size={18} />
              <input 
                type="text" 
                required 
                placeholder="Ex: AutoRent SARL"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-full">
              <label>Nom du Gérant</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group w-full">
              <label>Téléphone</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input 
                  type="tel" 
                  required 
                  placeholder="+212 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Adresse Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                required 
                placeholder="contact@agence.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                required 
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <span className="input-hint">Au moins 6 caractères</span>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Lancer mon agence maintenant"}
          </button>
        </form>

        <div className="register-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

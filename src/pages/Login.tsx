import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Globe, Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agencyName, setAgencyName] = useState('');

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'superadmin') {
          navigate('/superadmin');
        } else {
          navigate('/dashboard');
        }
      }
    });
  }, [navigate]);

  const toggleLang = () => {
    const nextLng = isAr ? 'fr' : 'ar';
    i18n.changeLanguage(nextLng);
    document.documentElement.dir = nextLng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLng;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: email.split('@')[0],
              role: 'admin'
            }
          }
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: rpcError } = await supabase.rpc('register_agency', {
            admin_email: email,
            agency_name: agencyName || 'My Agency'
          });
          if (rpcError) console.error("Error registering agency:", rpcError);
        }

        alert(isAr ? 'تم إنشاء الحساب بمدة تجريبية 48 ساعة!' : 'Compte créé avec essai de 48h ! Vous pouvez vous connecter.');
        setMode('login');
      }

      if (mode === 'login') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          setLoading(false);
          if (profile?.role === 'superadmin') {
            navigate('/superadmin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setLoading(false);
          navigate('/dashboard');
        }
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || (isAr ? 'حدث خطأ' : 'Une erreur est survenue'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="bg-shape bg-shape-1" />
        <div className="bg-shape bg-shape-2" />
        <div className="bg-shape bg-shape-3" />
      </div>

      <button className="login-lang-btn" onClick={toggleLang}>
        <Globe size={16} /> {isAr ? 'Français' : 'العربية'}
      </button>

      <div className="login-container">
        <div className="login-brand-panel">
          <div className="login-brand-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="login-brand-logo" style={{ marginBottom: '2rem' }}>
              <img src="/logo.svg" alt="VEKTORLAPS" style={{ width: '160px', height: 'auto', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }} />
            </div>
            <div className="login-brand-features">
              <div className="brand-feature"><span className="brand-feature-dot" /> {isAr ? 'إدارة الأسطول' : 'Gestion de Flotte'}</div>
              <div className="brand-feature"><span className="brand-feature-dot" /> {isAr ? 'العقود والحجوزات' : 'Contrats & Réservations'}</div>
              <div className="brand-feature"><span className="brand-feature-dot" /> {isAr ? 'نظام متعدد الشركات' : 'Plateforme Multi-Agences'}</div>
            </div>
          </div>
          <p className="login-brand-footer">
            © 2026 VEKTORLAPS — SaaS Management
          </p>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-header">
              <h2>{mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Connexion') : (isAr ? 'إنشاء حساب' : 'Créer un cuenta')}</h2>
              <p>{mode === 'login' 
                ? (isAr ? 'أدخل بيانات الاعتماد الخاصة بك' : 'Entrez vos identifiants para acceder al sistema')
                : (isAr ? 'قم بإنشاء حسابك الأول للبدء' : 'Créez votre premier compte pour commencer')}
              </p>
            </div>

            {error && <div className="login-error">{error}</div>}

            {mode === 'signup' && (
              <div className="input-group">
                <label className="input-label">
                  {isAr ? 'اسم وكالتك' : 'Nom de votre agence'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="RentCar Express"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">
                <Mail size={16} /> {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={16} /> {isAr ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <div className="login-password-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="login-eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="login-form-options">
                <label className="login-checkbox-label">
                  <input type="checkbox" /> {isAr ? 'تذكرني' : 'Se souvenir de moi'}
                </label>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : (mode === 'login' ? (isAr ? 'دخول' : 'Se connecter') : (isAr ? 'تسجيل' : 'S\'inscrire'))}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

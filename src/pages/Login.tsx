import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Globe, Lock, Mail, ArrowLeft } from 'lucide-react';
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

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  useEffect(() => {
    // Check if recovery link was clicked
    if (window.location.search.includes('type=recovery') || window.location.hash.includes('type=recovery')) {
      setMode('reset');
    }
  }, []);

  useEffect(() => {
    // Redirect if already logged in (but not in password reset state)
    if (mode === 'reset') return;
    
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
  }, [navigate, mode]);

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
      } else if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: email.split('@')[0],
              role: 'admin',
              company_name: agencyName || 'My Agency'
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
      } else if (mode === 'forgot') {
        const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?type=recovery`
        });
        if (forgotError) throw forgotError;
        alert(isAr ? 'تم إرسال رابط إعادة تعيين كلمة المرور!' : 'Lien de réinitialisation envoyé par e-mail !');
        setMode('login');
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.updateUser({
          password: password
        });
        if (resetError) throw resetError;
        alert(isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Mot de passe réinitialisé avec succès !');
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

      <button className="login-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> {isAr ? 'الرئيسية' : 'Accueil'}
      </button>

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
              <h2>
                {mode === 'login' && (isAr ? 'تسجيل الدخول' : 'Connexion')}
                {mode === 'signup' && (isAr ? 'إنشاء حساب' : 'Créer un compte')}
                {mode === 'forgot' && (isAr ? 'نسيت كلمة المرور' : 'Mot de passe oublié')}
                {mode === 'reset' && (isAr ? 'إعادة تعيين كلمة المرور' : 'Nouveau mot de passe')}
              </h2>
              <p>
                {mode === 'login' && (isAr ? 'أدخل بيانات الاعتماد الخاصة بك' : 'Entrez vos identifiants pour accéder al sistema')}
                {mode === 'signup' && (isAr ? 'قم بإنشاء حسابك الأول للبدء' : 'Créez votre premier compte pour commencer')}
                {mode === 'forgot' && (isAr ? 'أدخل بريدك الإلكتروني لتلقي رابط الاستعادة' : 'Saisissez votre e-mail pour recevoir le lien de réinitialisation')}
                {mode === 'reset' && (isAr ? 'أدخل كلمة المرور الجديدة الخاصة بك' : 'Saisissez votre nouveau mot de passe')}
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

            {mode !== 'reset' && (
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
            )}

            {mode !== 'forgot' && (
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
            )}

            {mode === 'login' && (
              <div className="login-form-options">
                <label className="login-checkbox-label">
                  <input type="checkbox" /> {isAr ? 'تذكرني' : 'Se souvenir de moi'}
                </label>
                <button 
                  type="button" 
                  className="login-forgot" 
                  onClick={() => setMode('forgot')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                </button>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  {mode === 'login' && (isAr ? 'دخول' : 'Se connecter')}
                  {mode === 'signup' && (isAr ? 'تسجيل' : "S'inscrire")}
                  {mode === 'forgot' && (isAr ? 'إرسال الرابط' : 'Envoyer le lien')}
                  {mode === 'reset' && (isAr ? 'تحديث كلمة المرور' : 'Mettre à jour')}
                </>
              )}
            </button>

            {mode === 'login' && (
              <div className="login-switch-mode">
                {isAr ? 'ليس لديك حساب؟' : "Vous n'avez pas de compte ?"}
                <button type="button" onClick={() => setMode('signup')}>
                  {isAr ? 'سجل وكالتك' : "Créer un compte"}
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="login-switch-mode">
                {isAr ? 'لديك حساب بالفعل؟' : "Vous avez déjà un compte ?"}
                <button type="button" onClick={() => setMode('login')}>
                  {isAr ? 'تسجيل الدخول' : "Se connecter"}
                </button>
              </div>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <div className="login-switch-mode">
                <button type="button" onClick={() => setMode('login')}>
                  {isAr ? 'العودة لتسجيل الدخول' : "Retour à la connexion"}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { 
  Save, User, Users, Sun, Moon, Loader2, 
  Globe, Building2, LayoutGrid, X, FileText,
  Settings as SettingsIcon, CreditCard, Bell, Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/common/ImageUpload';
import './Settings.css';

const Settings = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const [tab, setTab] = useState<'general' | 'branches' | 'users' | 'subscription'>('general');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for real data
  const [company, setCompany] = useState<any>({ 
    name: '', phone: '', address: '', tva_default_rate: 20, ice: '',
    logo_url: '', currency: 'MAD', invoice_prefix: 'FAC-', default_contract_terms: '',
    theme_color: 'orange',
    daily_mileage_limit: 'Ilimitado',
    fuel_policy: 'Lleno a Lleno',
    late_fee_per_hour: 0,
    default_deposit: 0,
    send_reminders: false,
    subscription_plan: 'pro',
    mrr: 0,
    storage_used_mb: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<any>({ full_name: '', email: '', password: '', role: 'employee', branch_id: '' });
  const [savingUser, setSavingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  // States for branches
  const [branches, setBranches] = useState<any[]>([]);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', city: '', address: '', phone: '' });
  const [savingBranch, setSavingBranch] = useState(false);

  useEffect(() => {
    // Sync dark mode from local storage or document attribute
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setDarkMode(isDark);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Get current user's profile to know their company_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("No user found");
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
        
      if (!profileData?.company_id) throw new Error("No company assigned to user");

      const [compRes, userRes, branchRes] = await Promise.all([
        supabase.from('companies').select('*').eq('id', profileData.company_id).single(),
        supabase.from('profiles').select('*, branches(name)').eq('company_id', profileData.company_id),
        supabase.from('branches').select('*').eq('company_id', profileData.company_id).order('created_at', { ascending: true })
      ]);

      if (compRes.data) {
        setCompany(compRes.data);
      } else if (compRes.error) {
        console.error("Error fetching company:", compRes.error);
      }
      
      setUsers(userRes.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!company.id) {
      alert(isAr ? 'لم يتم العثور على سجل الشركة' : 'ID de la société non trouvé');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          phone: company.phone,
          address: company.address,
          ice: company.ice,
          tva_default_rate: Number(company.tva_default_rate || 20),
          logo_url: company.logo_url,
          currency: company.currency,
          invoice_prefix: company.invoice_prefix,
          default_contract_terms: company.default_contract_terms,
          theme_color: company.theme_color,
          daily_mileage_limit: company.daily_mileage_limit,
          fuel_policy: company.fuel_policy,
          late_fee_per_hour: Number(company.late_fee_per_hour || 0),
          default_deposit: Number(company.default_deposit || 0),
          send_reminders: company.send_reminders
        })
        .eq('id', company.id);

      if (error) throw error;
      alert(isAr ? 'تم حفظ التعديلات بنجاح' : 'Paramètres enregistrés avec succès');
    } catch (err) {
      console.error('Save error:', err);
      alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      alert(isAr ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir todos los campos');
      return;
    }
    setSavingUser(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role,
            branch_id: (newUser as any).branch_id || null
          }
        }
      });

      if (error) throw error;
      alert(isAr ? 'تم إنشاء المستخدم بنجاح' : 'Utilisateur créé avec succès');
      setShowAddUser(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'employee', branch_id: '' });
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          branch_id: editingUser.branch_id || null
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      alert(isAr ? 'تم تحديث المستخدم بنجاح' : 'Utilisateur mis à jour avec succès');
      setEditingUser(null);
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error updating user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser || !newPassword) {
      alert(isAr ? 'يرجى إدخال كلمة المرور الجديدة' : 'Veuillez saisir le nouveau mot de passe');
      return;
    }
    if (newPassword.length < 6) {
      alert(isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.rpc('admin_reset_user_password', {
        target_user_id: editingUser.id,
        new_password: newPassword
      });

      if (error) throw error;
      alert(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Mot de passe modifié avec succès');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error resetting password');
    } finally {
      setSendingReset(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranch.name) {
      alert(isAr ? 'يرجى إدخال اسم الفرع' : 'Veuillez saisir le nom de l\'agence');
      return;
    }
    setSavingBranch(true);
    try {
      const { error } = await supabase.from('branches').insert([{
        company_id: company.id,
        name: newBranch.name,
        city: newBranch.city,
        address: newBranch.address,
        phone: newBranch.phone
      }]);
      if (error) throw error;
      alert(isAr ? 'تمت الإضافة بنجاح' : 'Agence ajoutée avec succès');
      setShowAddBranch(false);
      setNewBranch({ name: '', city: '', address: '', phone: '' });
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating branch');
    } finally {
      setSavingBranch(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-primary inline-block" /></div>;

  return (
    <>
      <div className="settings-page">
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="tab-bar">
            <button className={`tab ${tab === 'general' ? 'tab-active' : ''}`} onClick={() => setTab('general')}>
              <Building2 size={16} /> {isAr ? 'بيانات الوكالة' : 'Informations'}
            </button>
            <button className={`tab ${tab === 'branches' ? 'tab-active' : ''}`} onClick={() => setTab('branches')}>
              <LayoutGrid size={16} /> {isAr ? 'الفروع' : 'Succursales'}
            </button>
            <button className={`tab ${tab === 'users' ? 'tab-active' : ''}`} onClick={() => setTab('users')}>
              <Users size={16} /> {isAr ? 'المستخدمون' : 'Utilisateurs'}
            </button>
            <button className={`tab ${tab === 'subscription' ? 'tab-active' : ''}`} onClick={() => setTab('subscription')}>
              <CreditCard size={16} /> {isAr ? 'اشتراكي' : 'Abonnement'}
            </button>
          </div>

          {tab === 'general' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="settings-main-grid">
                <section className="settings-card">
                  <div className="card-header">
                    <Building2 size={20} className="text-gold" />
                    <h3>{isAr ? 'هوية الوكالة' : 'Identité de l\'Agence'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="input-group">
                        <label className="input-label">{isAr ? 'اسم الشركة' : 'Nom de la Société'}</label>
                        <input className="input-field" value={company.name || ''} 
                          onChange={e => setCompany({...company, name: e.target.value})} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">{isAr ? 'الهاتف' : 'Téléphone'}</label>
                        <input className="input-field" value={company.phone || ''}
                          onChange={e => setCompany({...company, phone: e.target.value})} />
                      </div>
                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">{isAr ? 'العنوان' : 'Adresse'}</label>
                        <input className="input-field" value={company.address || ''}
                          onChange={e => setCompany({...company, address: e.target.value})} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">ICE</label>
                        <input className="input-field" value={company.ice || ''}
                          onChange={e => setCompany({...company, ice: e.target.value})} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">TVA (%)</label>
                        <input className="input-field" type="number" value={company.tva_default_rate || ''}
                          onChange={e => setCompany({...company, tva_default_rate: e.target.value})} />
                      </div>
                    </div>

                    <div className="form-grid mt-6 pt-6 border-top">
                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <h4 className="flex items-center gap-2 mb-4" style={{ color: 'var(--gold)' }}>
                          <FileText size={18} /> {isAr ? 'إعدادات الفواتير والعقود' : 'Facturation & Contrats'}
                        </h4>
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">{isAr ? 'شعار الشركة (يظهر في العقود)' : 'Logo (affiché sur les contrats)'}</label>
                        <ImageUpload 
                          bucket="documents" 
                          currentImage={company.logo_url} 
                          onUploadComplete={(url) => setCompany({...company, logo_url: url})}
                        />
                      </div>

                      <div className="input-group form-grid">
                        <div className="mb-4">
                          <label className="input-label">{isAr ? 'العملة' : 'Devise'}</label>
                          <select className="input-field" value={company.currency || 'MAD'} onChange={e => setCompany({...company, currency: e.target.value})}>
                            <option value="MAD">MAD (Dirham Marocain)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="input-label">{isAr ? 'بادئة الفاتورة' : 'Préfixe de Facturation'}</label>
                          <input className="input-field" placeholder="FAC-" value={company.invoice_prefix || 'FAC-'}
                            onChange={e => setCompany({...company, invoice_prefix: e.target.value})} />
                          <small className="text-secondary text-xs mt-1 block">Ex: FAC-2026-001</small>
                        </div>
                      </div>

                      <div className="input-group form-grid">
                        <div>
                          <label className="input-label">{isAr ? 'حد الكيلومترات اليومي' : 'Kilométrage Journalier'}</label>
                          <select className="input-field" value={company.daily_mileage_limit || 'Ilimitado'} onChange={e => setCompany({...company, daily_mileage_limit: e.target.value})}>
                            <option value="Ilimitado">Ilimitado (Illimité)</option>
                            <option value="200">200 km/jour</option>
                            <option value="300">300 km/jour</option>
                            <option value="400">400 km/jour</option>
                          </select>
                        </div>
                        <div>
                          <label className="input-label">{isAr ? 'سياسة الوقود' : 'Politique Carburant'}</label>
                          <select className="input-field" value={company.fuel_policy || 'Lleno a Lleno'} onChange={e => setCompany({...company, fuel_policy: e.target.value})}>
                            <option value="Lleno a Lleno">Plein à Plein</option>
                            <option value="Mismo Nivel">Même Niveau</option>
                          </select>
                        </div>
                      </div>

                      <div className="input-group form-grid">
                        <div>
                          <label className="input-label">{isAr ? 'رسوم التأخير (للساعة)' : 'Frais de Retard / Heure'}</label>
                          <input type="number" className="input-field" value={company.late_fee_per_hour || 0}
                            onChange={e => setCompany({...company, late_fee_per_hour: e.target.value})} />
                        </div>
                        <div>
                          <label className="input-label">{isAr ? 'الضمان الافتراضي' : 'Caution par Défaut'}</label>
                          <input type="number" className="input-field" value={company.default_deposit || 0}
                            onChange={e => setCompany({...company, default_deposit: e.target.value})} />
                        </div>
                      </div>

                      <div className="input-group flex items-center gap-4 bg-surface-2 p-4 rounded-lg border">
                        <input type="checkbox" id="sendReminders" checked={company.send_reminders || false}
                          onChange={e => setCompany({...company, send_reminders: e.target.checked})} 
                          style={{ width: '1.2rem', height: '1.2rem' }} />
                        <label htmlFor="sendReminders" className="input-label m-0 cursor-pointer" style={{ fontSize: '0.95rem' }}>
                          <Bell size={16} className="inline-block mr-2 text-gold" />
                          {isAr ? 'إرسال تذكيرات تلقائية للعملاء قبل 24 ساعة من موعد الإرجاع' : 'Envoyer des rappels automatiques 24h avant le retour du véhicule'}
                        </label>
                      </div>

                      <div className="input-group">
                        <label className="input-label">{isAr ? 'لون الواجهة' : 'Couleur du Thème'}</label>
                        <select className="input-field" value={company.theme_color || 'orange'} onChange={e => {
                            const newTheme = e.target.value;
                            setCompany({...company, theme_color: newTheme});
                            document.documentElement.setAttribute('data-brand-theme', newTheme);
                            localStorage.setItem('brand-theme', newTheme);
                            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                            if (link) link.href = newTheme === 'green' ? '/logo-green.svg' : '/logo.svg';
                        }}>
                          <option value="orange">{isAr ? 'برتقالي (كلاسيكي)' : 'Orange (Classique)'}</option>
                          <option value="green">{isAr ? 'أخضر (عصري)' : 'Vert (Moderne)'}</option>
                        </select>
                      </div>

                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">{isAr ? 'الشروط القانونية الافتراضية للعقود' : 'Conditions légales par défaut (bas du contrat)'}</label>
                        <textarea className="input-field" rows={4} value={company.default_contract_terms || ''}
                          placeholder={isAr ? 'أدخل الشروط والأحكام هنا...' : 'Saisissez vos conditions de location...'}
                          onChange={e => setCompany({...company, default_contract_terms: e.target.value})}></textarea>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-top flex justify-end">
                      <button className="btn btn-primary px-10" onClick={handleSaveCompany} disabled={loading}>
                        <Save size={18} /> {isAr ? 'حفظ التغييرات' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                </section>

                <aside className="settings-sidebar-col">
                  <div className="settings-card mb-6">
                    <div className="card-header">
                      <LayoutGrid size={18} className="text-gold" />
                      <h3>{isAr ? 'التخصيص' : 'Personnalisation'}</h3>
                    </div>
                    <div className="card-body">
                      <div className="input-group mb-6">
                        <label className="input-label">{isAr ? 'اللغة الافتراضية' : 'Langue par Défaut'}</label>
                        <select className="input-field" value={i18n.language} onChange={e => handleLangChange(e.target.value)}>
                          <option value="fr">Français</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>

                      <div className="theme-toggle-row flex items-center justify-between p-4 bg-surface-2 rounded-lg border">
                        <span className="text-sm font-bold">{darkMode ? (isAr ? 'الوضع الليلي' : 'Mode Nuit') : (isAr ? 'الوضع النهاري' : 'Mode Jour')}</span>
                        <button className="theme-switch-btn" onClick={toggleTheme}>
                          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="settings-card p-6 bg-surface-2 border-dashed flex items-center gap-4">
                     <div className="icon-badge bg-gold-light text-gold"><Globe size={20} /></div>
                     <p className="text-xs text-secondary m-0 leading-relaxed">
                       {isAr ? 'سيتم تطبيق التغييرات على جميع المستندات والتقارير الصادرة.' : 'Les changements seront appliqués à tous les documents et rapports.'}
                     </p>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {tab === 'subscription' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="settings-main-grid">
                <section className="settings-card">
                  <div className="card-header">
                    <CreditCard size={20} className="text-gold" />
                    <h3>{isAr ? 'حالة الاشتراك' : 'Statut de l\'Abonnement'}</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="p-4 bg-surface-2 rounded-lg border text-center">
                        <span className="text-sm text-secondary block mb-1">Plan Actuel</span>
                        <h4 className="text-xl font-bold uppercase text-gold">{company.subscription_plan || 'TRIAL'}</h4>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-lg border text-center">
                        <span className="text-sm text-secondary block mb-1">Status</span>
                        <h4 className={`text-xl font-bold uppercase ${company.status === 'active' ? 'text-success' : 'text-warning'}`}>
                          {company.status || 'Active'}
                        </h4>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-lg border text-center">
                        <span className="text-sm text-secondary block mb-1">Coût Mensuel (MRR)</span>
                        <h4 className="text-xl font-bold">{company.mrr || '0.00'} DH</h4>
                      </div>
                      <div className="p-4 bg-surface-2 rounded-lg border text-center">
                        <span className="text-sm text-secondary block mb-1">Membre Depuis</span>
                        <h4 className="text-lg font-bold">
                          {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="flex items-center gap-2 mb-4">
                        <Database size={18} className="text-gold" /> Stockage Utilisé
                      </h4>
                      <div className="bg-surface-2 rounded-full h-4 overflow-hidden border">
                        <div className="bg-gold h-full" style={{ width: `${Math.min((company.storage_used_mb / 500) * 100, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-secondary">
                        <span>{company.storage_used_mb || '0'} MB utilisés</span>
                        <span>Limite 500 MB</span>
                      </div>
                    </div>
                  </div>
                </section>
                <aside className="settings-sidebar-col">
                  <div className="settings-card p-6 bg-surface-2 border-dashed flex items-center gap-4">
                     <div className="icon-badge bg-gold-light text-gold"><CreditCard size={20} /></div>
                     <p className="text-xs text-secondary m-0 leading-relaxed">
                       {isAr ? 'لترقية اشتراكك أو تعديل معلومات الدفع، يرجى التواصل مع فريق الدعم.' : 'Pour mettre à niveau votre abonnement ou modifier vos informations de paiement, veuillez contacter le support.'}
                     </p>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {tab === 'branches' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="settings-card user-table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isAr ? 'اسم الفرع' : 'NOM DE LA SUCCURSALE'}</th>
                      <th>{isAr ? 'المدينة' : 'VILLE'}</th>
                      <th>{isAr ? 'الهاتف' : 'TÉLÉPHONE'}</th>
                      <th>{isAr ? 'العنوان' : 'ADRESSE'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-secondary">
                          {isAr ? 'لا توجد فروع حتى الآن.' : 'Aucune succursale pour le moment.'}
                        </td>
                      </tr>
                    ) : (
                      branches.map(b => (
                        <tr key={b.id}>
                          <td className="font-bold">{b.name}</td>
                          <td>{b.city}</td>
                          <td>{b.phone}</td>
                          <td className="text-sm text-secondary">{b.address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="settings-card user-table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isAr ? 'المستخدم' : 'COLLABORATEUR'}</th>
                      <th>{isAr ? 'البريد الإلكتروني' : 'EMAIL'}</th>
                      <th>{isAr ? 'الصلاحية' : 'RÔLE'}</th>
                      <th style={{ textAlign: 'right' }}>{isAr ? 'إجراءات' : 'ACTIONS'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="user-row">
                        <td>
                          <div className="flex items-center gap-4">
                            <div className="avatar-xs" style={{ background: 'var(--gold-light)', color: '#fff' }}>
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-bold">{u.full_name || 'Utilisateur'}</div>
                              <div className="text-xs text-secondary italic">Membre depuis 2024</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary font-mono text-sm">{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
                            {u.role || 'employee'}
                          </span>
                          {u.branches?.name && <span className="text-xs text-secondary block mt-1 ml-1">{u.branches.name}</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => setEditingUser(u)}>
                            <SettingsIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Floating Actions */}
        {tab === 'branches' && (
          <div className="page-actions">
             <button className="btn btn-primary px-12 py-4 shadow-lg text-lg" onClick={() => setShowAddBranch(true)}>
                <Building2 size={20} /> {isAr ? 'إضافة فرع جديد' : 'Ajouter une succursale'}
             </button>
          </div>
        )}
        {tab === 'users' && (
          <div className="page-actions">
             <button className="btn btn-primary px-12 py-4 shadow-lg text-lg" onClick={() => setShowAddUser(true)}>
                <User size={20} /> {isAr ? 'إضافة مستخدم جديد' : 'Ajouter un Collaborateur'}
             </button>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
           <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h3 className="m-0">{isAr ? 'إضافة مستخدم جديد' : 'Ajouter un usuario'}</h3>
                 <button className="btn btn-ghost" onClick={() => setShowAddUser(false)}><X size={20} /></button>
              </div>

              <div className="form-grid">
                 <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">{isAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
                    <input className="input-field" value={newUser.full_name} 
                      onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input className="input-field" type="email" value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'كلمة المرور' : 'Mot de passe'}</label>
                    <input className="input-field" type="password" value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'الدور' : 'Rôle'}</label>
                    <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                       <option value="employee">{isAr ? 'موظف' : 'Employé'}</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'الفرع (اختياري)' : 'Succursale (Optionnel)'}</label>
                    <select className="input-field" value={(newUser as any).branch_id || ''} onChange={e => setNewUser({...newUser, branch_id: e.target.value})}>
                       <option value="">{isAr ? 'جميع الفروع' : 'Toutes les succursales'}</option>
                       {branches.map(b => (
                         <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div className="flex gap-4 mt-8 justify-end">
                 <button className="btn btn-outline" onClick={() => setShowAddUser(false)}>{isAr ? 'إلغاء' : 'Annuler'}</button>
                 <button className="btn btn-primary px-8" onClick={handleCreateUser} disabled={savingUser}>
                    {savingUser ? <Loader2 className="animate-spin" size={16} /> : (isAr ? 'إنشاء' : 'Créer')}
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
           <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h3 className="m-0">{isAr ? 'تعديل المستخدم' : 'Modifier l\'Utilisateur'}</h3>
                 <button className="btn btn-ghost" onClick={() => setEditingUser(null)}><X size={20} /></button>
              </div>

              <div className="form-grid">
                 <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">{isAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
                    <input className="input-field" value={editingUser.full_name || ''} 
                      onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input className="input-field" type="email" value={editingUser.email || ''} disabled style={{ opacity: 0.6 }} />
                    <small className="text-xs text-secondary mt-1 block">
                      {isAr ? 'لا يمكن تغيير البريد الإلكتروني هنا' : 'L\'email ne peut pas être modifié ici'}
                    </small>
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'الدور' : 'Rôle'}</label>
                    <select className="input-field" value={editingUser.role || 'employee'} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                       <option value="employee">{isAr ? 'موظف' : 'Employé'}</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'الفرع (اختياري)' : 'Succursale (Optionnel)'}</label>
                    <select className="input-field" value={editingUser.branch_id || ''} onChange={e => setEditingUser({...editingUser, branch_id: e.target.value})}>
                       <option value="">{isAr ? 'جميع الفروع' : 'Toutes les succursales'}</option>
                       {branches.map(b => (
                         <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-top">
                <h4 className="text-sm font-bold mb-3">{isAr ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'}</h4>
                <div className="flex gap-2 items-center">
                  <input 
                    className="input-field" 
                    type="text" 
                    placeholder={isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    className="btn btn-outline whitespace-nowrap" 
                    onClick={handleResetPassword} 
                    disabled={sendingReset || !newPassword}
                  >
                    {sendingReset ? <Loader2 className="animate-spin" size={16} /> : (isAr ? 'تغيير' : 'Changer')}
                  </button>
                </div>
                <small className="text-xs text-warning mt-2 block">
                  {isAr ? 'سيتم تغيير كلمة المرور فوراً ولا يمكن التراجع.' : 'Le mot de passe sera changé immédiatement.'}
                </small>
              </div>

              <div className="flex gap-4 mt-8 justify-end">
                 <button className="btn btn-outline" onClick={() => { setEditingUser(null); setNewPassword(''); }}>{isAr ? 'إلغاء' : 'Annuler'}</button>
                 <button className="btn btn-primary px-8" onClick={handleUpdateUser} disabled={savingUser}>
                    {savingUser ? <Loader2 className="animate-spin" size={16} /> : (isAr ? 'حفظ' : 'Enregistrer')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="modal-overlay" onClick={() => setShowAddBranch(false)}>
           <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h3 className="m-0">{isAr ? 'إضافة فرع جديد' : 'Nouvelle Succursale'}</h3>
                 <button className="btn btn-ghost" onClick={() => setShowAddBranch(false)}><X size={20} /></button>
              </div>

              <div className="form-grid">
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'اسم الفرع' : 'Nom de l\'agence'}</label>
                    <input className="input-field" value={newBranch.name} 
                      onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'المدينة' : 'Ville'}</label>
                    <input className="input-field" value={newBranch.city} 
                      onChange={e => setNewBranch({...newBranch, city: e.target.value})} />
                 </div>
                 <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">{isAr ? 'العنوان' : 'Adresse'}</label>
                    <input className="input-field" value={newBranch.address} 
                      onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label className="input-label">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                    <input className="input-field" value={newBranch.phone} 
                      onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                 </div>
              </div>

              <div className="flex gap-4 mt-8 justify-end">
                 <button className="btn btn-outline" onClick={() => setShowAddBranch(false)}>{isAr ? 'إلغاء' : 'Annuler'}</button>
                 <button className="btn btn-primary px-8" onClick={handleCreateBranch} disabled={savingBranch}>
                    {savingBranch ? <Loader2 className="animate-spin" size={16} /> : (isAr ? 'إضافة' : 'Ajouter')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Layout, Globe, Palette, Phone, Save, AlertCircle } from 'lucide-react';
import './WebsiteBuilder.css';

export default function WebsiteBuilder() {
  const { t } = useTranslation();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    slug: '',
    template: 'modern',
    themeColor: '#10b981',
    themeSecondary: '#0F172A',
    whatsapp: '',
    instagram: '',
    facebook: '',
    aboutText: '',
    heroTitle: 'Alquiler de Vehículos',
    heroSubtitle: 'La mejor flota al mejor precio'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadSettings(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function loadSettings(userId: string) {
    try {
      // Get the correct company ID (check impersonation first)
      const impId = localStorage.getItem('impersonated_company_id');
      let targetCompanyId = impId;
      
      if (!targetCompanyId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', userId)
          .single();
        targetCompanyId = prof?.company_id;
      }

      if (!targetCompanyId) {
        throw new Error('No tienes asignada una agencia (company_id).');
      }

      setCompanyId(targetCompanyId);

      const { data, error } = await supabase
        .from('companies')
        .select('slug, storefront_config')
        .eq('id', targetCompanyId)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          slug: data.slug || '',
          ...(data.storefront_config || {})
        });
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!companyId) throw new Error('No se pudo determinar el ID de tu agencia.');

      const { slug, ...config } = formData;
      
      // Clean slug: lowercase, no spaces
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const { error } = await supabase
        .from('companies')
        .update({
          slug: cleanSlug,
          storefront_config: config
        })
        .eq('id', companyId);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Ese enlace ya está siendo usado por otra agencia. Elige uno diferente.');
        }
        throw error;
      }

      setSuccess('¡Sitio web actualizado correctamente!');
      setFormData(prev => ({ ...prev, slug: cleanSlug }));
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando constructor...</div>;
  }

  const publicUrl = formData.slug ? `${window.location.origin}/booking/${formData.slug}` : '';

  return (
    <div className="wb-page-container">
      <div className="wb-wrapper">
        
        <div className="wb-header">
          <div className="wb-header-bg"></div>
          <div className="wb-header-content">
            <h1 className="wb-title">{t('website_builder.title')}</h1>
            <p className="wb-subtitle">{t('website_builder.subtitle')}</p>
          </div>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="wb-visit-btn">
              <Globe size={18} />
              <span>{t('website_builder.visit_website')}</span>
            </a>
          )}
        </div>

        {error && (
          <div className="wb-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="wb-alert-success">
            <span>{success}</span>
          </div>
        )}

        <div className="wb-grid">
          
          <div className="wb-form-col">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="wb-card">
                <h2 className="wb-card-title">
                  <Layout size={24} color="#3B82F6" />
                  {t('website_builder.basic_config')}
                </h2>
                <div className="wb-form-row">
                  <div className="wb-form-group" style={{ width: '100%' }}>
                    <label className="wb-label">Estilo de Plantilla</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div 
                        onClick={() => setFormData({...formData, template: 'modern'})}
                        style={{ 
                          border: formData.template === 'modern' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                          borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer', textAlign: 'center',
                          backgroundColor: formData.template === 'modern' ? '#EFF6FF' : 'white'
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1E293B' }}>Modern Premium</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Cabeceras oscuras y transparencias (Glassmorphism)</span>
                      </div>
                      <div 
                        onClick={() => setFormData({...formData, template: 'classic'})}
                        style={{ 
                          border: formData.template === 'classic' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                          borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer', textAlign: 'center',
                          backgroundColor: formData.template === 'classic' ? '#EFF6FF' : 'white'
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1E293B' }}>Classic Light</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Diseño minimalista en blanco, limpio y espacioso</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="wb-form-row">
                  <div className="wb-form-group">
                    <label className="wb-label">{t('website_builder.slug_label')}</label>
                    <div className="wb-input-wrapper">
                      <span className="wb-input-prefix">/booking/</span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                        className="wb-input"
                        placeholder={t('website_builder.slug_placeholder')}
                      />
                    </div>
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">{t('website_builder.theme_primary') || 'Color Principal'}</label>
                    <div className="wb-color-picker">
                      <input
                        type="color"
                        value={formData.themeColor}
                        onChange={e => setFormData({...formData, themeColor: e.target.value})}
                      />
                      <span className="wb-color-hex">{formData.themeColor}</span>
                    </div>
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">{t('website_builder.theme_secondary') || 'Color Secundario'}</label>
                    <div className="wb-color-picker">
                      <input
                        type="color"
                        value={formData.themeSecondary}
                        onChange={e => setFormData({...formData, themeSecondary: e.target.value})}
                      />
                      <span className="wb-color-hex">{formData.themeSecondary}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="wb-card">
                <h2 className="wb-card-title">
                  <Palette size={24} color="#10B981" />
                  {t('website_builder.appearance')}
                </h2>
                <div className="wb-form-group">
                  <label className="wb-label">{t('website_builder.hero_title')}</label>
                  <input
                    type="text"
                    required
                    value={formData.heroTitle}
                    onChange={e => setFormData({...formData, heroTitle: e.target.value})}
                    className="wb-input"
                  />
                </div>
                <div className="wb-form-group">
                  <label className="wb-label">{t('website_builder.hero_subtitle')}</label>
                  <input
                    type="text"
                    value={formData.heroSubtitle}
                    onChange={e => setFormData({...formData, heroSubtitle: e.target.value})}
                    className="wb-input"
                  />
                </div>
                <div className="wb-form-group">
                  <label className="wb-label">{t('website_builder.about')}</label>
                  <textarea
                    rows={4}
                    value={formData.aboutText}
                    onChange={e => setFormData({...formData, aboutText: e.target.value})}
                    className="wb-input"
                    placeholder={t('website_builder.about_placeholder')}
                  />
                </div>
              </div>

              <div className="wb-card">
                <h2 className="wb-card-title">
                  <Phone size={24} color="#8B5CF6" />
                  {t('website_builder.contact_social')}
                </h2>
                <div className="wb-form-row">
                  <div className="wb-form-group">
                    <label className="wb-label">{t('website_builder.whatsapp')}</label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      className="wb-input"
                      placeholder="+34600000000"
                    />
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">{t('website_builder.instagram')}</label>
                    <div className="wb-input-wrapper">
                      <span className="wb-input-prefix">@</span>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={e => setFormData({...formData, instagram: e.target.value})}
                        className="wb-input"
                        placeholder={t('website_builder.instagram_placeholder')}
                      />
                    </div>
                  </div>
                </div>
                <div className="wb-form-group">
                  <label className="wb-label">{t('website_builder.facebook')}</label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={e => setFormData({...formData, facebook: e.target.value})}
                    className="wb-input"
                    placeholder={t('website_builder.facebook_placeholder')}
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="wb-save-btn">
                <Save size={20} />
                {saving ? t('website_builder.saving') : t('website_builder.save')}
              </button>
            </form>
          </div>

          <div className="wb-preview-col">
            <div className="wb-preview-header">
              <span className="wb-dot"></span>
              {t('website_builder.live_preview')}
            </div>
            
            <div className="wb-phone-frame" style={{ borderColor: formData.themeSecondary }}>
              <div className="wb-phone-notch" style={{ backgroundColor: formData.themeSecondary }}></div>
              <div className="wb-phone-screen" style={{ backgroundColor: '#F8FAFC', overflowY: 'auto', display: 'block' }}>
                
                {/* Realistic Mobile Preview - Modern Template */}
                {formData.template === 'modern' && (
                  <>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ fontWeight: 800, color: formData.themePrimary || formData.themeColor, fontSize: '0.9rem' }}>Logo</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: formData.themeSecondary, opacity: 0.1 }}></div>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: formData.themeSecondary, opacity: 0.1 }}></div>
                      </div>
                    </div>
                    
                    <div style={{ backgroundColor: formData.themeSecondary, padding: '40px 20px', textAlign: 'center', color: 'white' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2 }}>{formData.heroTitle || 'Alquiler de Vehículos'}</h2>
                      <p style={{ color: formData.themePrimary || formData.themeColor, fontSize: '0.9rem' }}>{formData.heroSubtitle || 'La mejor flota'}</p>
                    </div>

                    <div style={{ padding: '20px 15px' }}>
                      {formData.aboutText && (
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.themeSecondary, marginBottom: '8px' }}>Sobre Nosotros</h4>
                          <div style={{ width: '30px', height: '3px', backgroundColor: formData.themeColor, marginBottom: '10px' }}></div>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>{formData.aboutText.substring(0, 100)}...</p>
                        </div>
                      )}

                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: formData.themeSecondary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: formData.themeColor }}>■</span> Nuestra Flota
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[1, 2].map(i => (
                          <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ height: '120px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <span style={{ fontSize: '2rem' }}>📸</span>
                              <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>300 MAD</div>
                            </div>
                            <div style={{ padding: '12px' }}>
                              <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Audi A3</h5>
                              <p style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#64748B' }}>Automático • Diesel</p>
                              <div style={{ backgroundColor: formData.themeColor, color: 'white', textAlign: 'center', padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                                Ver Detalles
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Realistic Mobile Preview - Classic Template */}
                {formData.template === 'classic' && (
                  <>
                    <div style={{ backgroundColor: 'white', padding: '15px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Logo</span>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '50px 20px', textAlign: 'center' }}>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 300, marginBottom: '10px', color: '#1E293B' }}>{formData.heroTitle || 'Alquiler Premium'}</h2>
                      <p style={{ color: '#64748B', fontSize: '0.9rem', letterSpacing: '1px' }}>{formData.heroSubtitle || 'EXPERIENCIA ÚNICA'}</p>
                      <div style={{ width: '40px', height: '2px', backgroundColor: formData.themeColor, margin: '20px auto 0' }}></div>
                    </div>

                    <div style={{ padding: '20px 15px', backgroundColor: '#F8FAFC' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Colección
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[1].map(i => (
                          <div key={i} style={{ backgroundColor: 'white', overflow: 'hidden' }}>
                            <div style={{ height: '180px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '2rem' }}>📸</span>
                            </div>
                            <div style={{ padding: '15px', textAlign: 'center' }}>
                              <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 400, color: '#1E293B' }}>Range Rover Velar</h5>
                              <div style={{ margin: '10px 0', fontSize: '0.9rem', fontWeight: 600, color: formData.themeColor }}>800 MAD / día</div>
                              <div style={{ border: `1px solid ${formData.themeColor}`, color: formData.themeColor, textAlign: 'center', padding: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Descubrir
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

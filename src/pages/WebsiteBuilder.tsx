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
              
              <div className="wb-phone-screen">
                <div className="wb-phone-nav" style={{ backgroundColor: formData.themeSecondary, borderBottom: 'none' }}>
                  <div className="wb-phone-logo" style={{ backgroundColor: formData.themeColor }}></div>
                  <div className="wb-phone-menu">
                    <span style={{ backgroundColor: '#ffffff' }}></span>
                    <span style={{ backgroundColor: '#ffffff' }}></span>
                  </div>
                </div>

                <div className="wb-phone-body">
                  <div className="wb-phone-hero" style={{ backgroundColor: formData.themeSecondary, color: 'white' }}>
                    <h2>{formData.heroTitle || 'Título...'}</h2>
                    <p style={{ color: formData.themeColor }}>{formData.heroSubtitle || 'Subtítulo...'}</p>
                  </div>

                  {formData.aboutText && (
                    <div className="wb-phone-about">
                      <div className="wb-phone-about-line"></div>
                      <p>{formData.aboutText}</p>
                    </div>
                  )}

                  <div className="wb-phone-fleet">
                    <h4>{t('website_builder.preview_fleet')}</h4>
                    <div className="wb-phone-card">
                      <div className="wb-phone-card-img">📸</div>
                      <div className="wb-phone-card-info">
                        <div className="wb-phone-card-title"></div>
                        <div className="wb-phone-card-subtitle"></div>
                        <div className="wb-phone-card-btn" style={{ backgroundColor: formData.themeColor }}>
                          {t('website_builder.preview_details')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

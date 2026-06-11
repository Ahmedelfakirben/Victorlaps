import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layout, Globe, Palette, Phone, Save, AlertCircle, Image as ImageIcon, Type, Sparkles, Box, CheckCircle2, Monitor, Smartphone, ChevronDown } from 'lucide-react';
import ImageUpload from '../components/common/ImageUpload';
import './WebsiteBuilder.css';

export default function WebsiteBuilder() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [previewVehicles, setPreviewVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    slug: '',
    template: 'modern',
    // Design & Colors
    themeColor: '#f97316',
    themeSecondary: '#0F172A',
    themeBgColor: '#0e1726',
    cardColor: '#f97316',
    themeFontHeading: 'Inter',
    themeFontBody: 'Inter',
    buttonShape: 'rounded',
    globalBackground: 'mesh',
    
    // Content & Hero
    heroBackgroundImage: '',
    heroTitle: 'Alquiler de Vehículos',
    heroSubtitle: 'La mejor flota al mejor precio',
    aboutText: '',
    
    // Custom Titles
    valuesTitle: 'Nuestros Valores',
    fleetTitle: 'Nuestra Flota',
    testimonialsTitle: 'Lo que dicen nuestros clientes',
    faqTitle: 'Preguntas Frecuentes',
    contactTitle: 'Contacto',

    // Toggles
    showValues: true,
    showStats: true,
    showAbout: true,
    showTestimonials: true,
    showFaq: true,
    
    // Cards Content
    value1Title: 'Seguro Premium',
    value1Text: 'Viaja con total tranquilidad gracias a nuestra cobertura a todo riesgo premium incluida.',
    value2Title: 'Soporte 24/7 Activo',
    value2Text: 'Asistencia en carretera y atención al cliente dedicada en cualquier momento de tu viaje.',
    value3Title: 'Entrega Flexible',
    value3Text: 'Recogida y devolución a medida en aeropuerto, hotel o cualquiera de nuestras oficinas.',
    
    // SEO & Branding
    metaTitle: '',
    metaDescription: '',
    faviconUrl: '',
    
    // Social
    whatsapp: '',
    instagram: '',
    facebook: '',
    // Stats content
    stat1Number: '50+',
    stat1Label: 'Vehículos Premium',
    stat2Number: '10k+',
    stat2Label: 'Clientes Satisfechos',
    stat3Number: '99%',
    stat3Label: 'Valoración Positiva',
    stat4Number: '24h',
    stat4Label: 'Soporte Express',
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
        setFormData(prev => ({
          ...prev,
          slug: data.slug || '',
          ...(data.storefront_config || {})
        }));
      }

      // Fetch vehicles for the preview
      const { data: fleet } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', targetCompanyId)
        .eq('status', 'available')
        .limit(3);
        
      if (fleet) {
        setPreviewVehicles(fleet);
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
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const { error } = await supabase
        .from('companies')
        .update({
          slug: cleanSlug,
          storefront_config: config
        })
        .eq('id', companyId);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ese enlace ya está siendo usado por otra agencia. Elige uno diferente.');
        }
        throw error;
      }

      setSuccess('¡Sitio web actualizado correctamente!');
      setFormData(prev => ({ ...prev, slug: cleanSlug }));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  const renderAccordionHeader = (id: string, label: string, icon: React.ReactNode) => (
    <button 
      type="button"
      className={`wb-accordion-header ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(activeTab === id ? '' : id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon} <span>{label}</span>
      </div>
      <ChevronDown className={`wb-chevron ${activeTab === id ? 'open' : ''}`} size={18} />
    </button>
  );

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando constructor...</div>;
  }

  const publicUrl = formData.slug ? `${window.location.origin}/booking/${formData.slug}` : '';

  // Calculate live preview gradient colors
  // color-mix(in srgb, var(--sf-primary) 65%, #000000 35%)
  const primaryColor = formData.themeColor || '#f97316';
  
  return (
    <div className="wb-page-container">
      <div className="wb-wrapper">
        
        <div className="wb-header">
          <div className="wb-header-bg" style={{ backgroundColor: primaryColor }}></div>
          <div className="wb-header-content">
            <h1 className="wb-title">App Builder 2.0</h1>
            <p className="wb-subtitle">Personaliza tu tienda de reservas al máximo nivel.</p>
          </div>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="wb-visit-btn">
              <Globe size={18} />
              <span>Ver Web Pública</span>
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
            <CheckCircle2 size={20} />
            <span>{success}</span>
          </div>
        )}

        <div className="wb-grid">
          
          <div className="wb-form-col">
            <form onSubmit={handleSubmit}>
              
              {/* DESIGN ACCORDION */}
              {renderAccordionHeader('design', 'Diseño y Fondos', <Palette size={18} />)}
              <div className={`wb-tab-content ${activeTab === 'design' ? 'active' : ''}`}>
                <div className="wb-card">
                  <h2 className="wb-card-title"><Palette size={20} color="#3B82F6"/> Colores Base</h2>
                  <div className="wb-form-row">
                    <div className="wb-form-group">
                      <label className="wb-label">Color Primario (Énfasis)</label>
                      <div className="wb-color-picker">
                        <input 
                          type="color" 
                          value={formData.themeColor} 
                          onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                        />
                        <span className="wb-color-hex">{formData.themeColor}</span>
                      </div>
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Color Secundario (Fondos alternos)</label>
                      <div className="wb-color-picker">
                        <input 
                          type="color" 
                          value={formData.themeSecondary} 
                          onChange={(e) => setFormData({...formData, themeSecondary: e.target.value})}
                        />
                        <span className="wb-color-hex">{formData.themeSecondary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="wb-form-row">
                    <div className="wb-form-group">
                      <label className="wb-label">Color de Tarjetas (Valores, Estadísticas)</label>
                      <div className="wb-color-picker">
                        <input 
                          type="color" 
                          value={formData.cardColor} 
                          onChange={(e) => setFormData({...formData, cardColor: e.target.value})}
                        />
                        <span className="wb-color-hex">{formData.cardColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title"><Sparkles size={20} color="#8B5CF6"/> Fondos Vivos Globales</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Elige una animación o textura para el fondo de toda tu web pública.
                  </p>
                  <div className="wb-options-grid">
                    <div className={`wb-option-card ${formData.globalBackground === 'solid' ? 'selected' : ''}`} onClick={() => setFormData({...formData, globalBackground: 'solid'})}>
                      <div className="wb-bg-preview" style={{ background: '#0e1726' }}></div>
                      <strong>Sólido</strong>
                      <span>Color oscuro liso</span>
                    </div>
                    <div className={`wb-option-card ${formData.globalBackground === 'mesh' ? 'selected' : ''}`} onClick={() => setFormData({...formData, globalBackground: 'mesh'})}>
                      <div className="wb-bg-preview" style={{ background: `radial-gradient(at 0% 0%, ${primaryColor}40 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 41, 59, 0.8) 0px, transparent 50%), #0e1726` }}></div>
                      <strong>Malla (Mesh)</strong>
                      <span>Degradados orgánicos</span>
                    </div>
                    <div className={`wb-option-card ${formData.globalBackground === 'aurora' ? 'selected' : ''}`} onClick={() => setFormData({...formData, globalBackground: 'aurora'})}>
                      <div className="wb-bg-preview" style={{ background: 'linear-gradient(120deg, #0e1726, #1e293b, #0e1726)' }}></div>
                      <strong>Aurora</strong>
                      <span>Efecto luces suaves</span>
                    </div>
                    <div className={`wb-option-card ${formData.globalBackground === 'orbs' ? 'selected' : ''}`} onClick={() => setFormData({...formData, globalBackground: 'orbs'})}>
                      <div className="wb-bg-preview" style={{ background: '#0e1726', position: 'relative', overflow: 'hidden' }}>
                         <div style={{ position: 'absolute', width: '40px', height: '40px', background: primaryColor, borderRadius: '50%', filter: 'blur(10px)', top: '10px', left: '10px', opacity: 0.5 }}></div>
                      </div>
                      <strong>Orbes</strong>
                      <span>Esferas flotantes</span>
                    </div>
                    <div className={`wb-option-card ${formData.globalBackground === 'grid' ? 'selected' : ''}`} onClick={() => setFormData({...formData, globalBackground: 'grid'})}>
                      <div className="wb-bg-preview" style={{ background: '#0e1726', backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                      <strong>Grid Neón</strong>
                      <span>Cuadrícula tecnológica</span>
                    </div>
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title"><Type size={20} color="#10B981"/> Motores Tipográficos</h2>
                  <div className="wb-form-row">
                    <div className="wb-form-group">
                      <label className="wb-label">Fuente de Títulos</label>
                      <select className="wb-select" value={formData.themeFontHeading} onChange={(e) => setFormData({...formData, themeFontHeading: e.target.value})}>
                        <option value="Inter">Inter (Moderna/Neutra)</option>
                        <option value="Montserrat">Montserrat (Geométrica)</option>
                        <option value="Outfit">Outfit (Tecnológica/Limpia)</option>
                        <option value="Playfair Display">Playfair Display (Clásica/Lujo)</option>
                        <option value="Clash Display">Clash Display (Audaz)</option>
                      </select>
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Fuente de Textos (Body)</label>
                      <select className="wb-select" value={formData.themeFontBody} onChange={(e) => setFormData({...formData, themeFontBody: e.target.value})}>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Lato">Lato</option>
                        <option value="Open Sans">Open Sans</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title"><Box size={20} color="#F43F5E"/> Geometría de Botones</h2>
                  <div className="wb-options-grid">
                    <div className={`wb-option-card ${formData.buttonShape === 'square' ? 'selected' : ''}`} onClick={() => setFormData({...formData, buttonShape: 'square'})}>
                      <div style={{ background: primaryColor, color: 'white', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600 }}>Botón</div>
                      <strong>Cuadrado</strong>
                    </div>
                    <div className={`wb-option-card ${formData.buttonShape === 'rounded' ? 'selected' : ''}`} onClick={() => setFormData({...formData, buttonShape: 'rounded'})}>
                      <div style={{ background: primaryColor, color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>Botón</div>
                      <strong>Esquinas Suaves</strong>
                    </div>
                    <div className={`wb-option-card ${formData.buttonShape === 'pill' ? 'selected' : ''}`} onClick={() => setFormData({...formData, buttonShape: 'pill'})}>
                      <div style={{ background: primaryColor, color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600 }}>Botón</div>
                      <strong>Píldora</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* STRUCTURE ACCORDION */}
              {renderAccordionHeader('structure', 'Estructura', <Layout size={18} />)}
              <div className={`wb-tab-content ${activeTab === 'structure' ? 'active' : ''}`}>
                <div className="wb-card">
                  <h2 className="wb-card-title"><Layout size={20} color="#3B82F6"/> Mostrar / Ocultar Secciones</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Controla exactamente qué módulos quieres que vean tus clientes en la tienda.
                  </p>

                  <div className="wb-toggle-row">
                    <div className="wb-toggle-info">
                      <span className="wb-toggle-title">Sección: Valores y Promesas</span>
                      <span className="wb-toggle-desc">Muestra los puntos fuertes de tu agencia.</span>
                    </div>
                    <label className="wb-switch">
                      <input type="checkbox" checked={formData.showValues} onChange={(e) => setFormData({...formData, showValues: e.target.checked})} />
                      <span className="wb-slider"></span>
                    </label>
                  </div>

                  <div className="wb-toggle-row">
                    <div className="wb-toggle-info">
                      <span className="wb-toggle-title">Sección: Estadísticas</span>
                      <span className="wb-toggle-desc">Muestra números llamativos (clientes felices, coches).</span>
                    </div>
                    <label className="wb-switch">
                      <input type="checkbox" checked={formData.showStats} onChange={(e) => setFormData({...formData, showStats: e.target.checked})} />
                      <span className="wb-slider"></span>
                    </label>
                  </div>

                  <div className="wb-toggle-row">
                    <div className="wb-toggle-info">
                      <span className="wb-toggle-title">Sección: Sobre Nosotros</span>
                      <span className="wb-toggle-desc">Texto explicativo de la historia de la empresa.</span>
                    </div>
                    <label className="wb-switch">
                      <input type="checkbox" checked={formData.showAbout} onChange={(e) => setFormData({...formData, showAbout: e.target.checked})} />
                      <span className="wb-slider"></span>
                    </label>
                  </div>

                  <div className="wb-toggle-row">
                    <div className="wb-toggle-info">
                      <span className="wb-toggle-title">Sección: Testimonios</span>
                      <span className="wb-toggle-desc">Reseñas y opiniones de clientes.</span>
                    </div>
                    <label className="wb-switch">
                      <input type="checkbox" checked={formData.showTestimonials} onChange={(e) => setFormData({...formData, showTestimonials: e.target.checked})} />
                      <span className="wb-slider"></span>
                    </label>
                  </div>

                  <div className="wb-toggle-row">
                    <div className="wb-toggle-info">
                      <span className="wb-toggle-title">Sección: Preguntas Frecuentes</span>
                      <span className="wb-toggle-desc">Acordeón con dudas y requisitos de alquiler.</span>
                    </div>
                    <label className="wb-switch">
                      <input type="checkbox" checked={formData.showFaq} onChange={(e) => setFormData({...formData, showFaq: e.target.checked})} />
                      <span className="wb-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* CONTENT ACCORDION */}
              {renderAccordionHeader('content', 'Contenido', <Type size={18} />)}
              <div className={`wb-tab-content ${activeTab === 'content' ? 'active' : ''}`}>
                <div className="wb-card">
                  <h2 className="wb-card-title"><ImageIcon size={20} color="#8B5CF6"/> Portada y Hero</h2>
                  
                  <div className="wb-form-group">
                    <label className="wb-label">Fondo de Cabecera (Imagen Premium)</label>
                    <div className="wb-options-grid" style={{ marginBottom: '1rem' }}>
                      <div className={`wb-option-card ${formData.heroBackgroundImage === '' ? 'selected' : ''}`} onClick={() => setFormData({...formData, heroBackgroundImage: ''})}>
                        <div className="wb-bg-preview" style={{ background: '#1E293B' }}>Sin Imagen</div>
                        <strong>Sin Imagen</strong>
                      </div>
                      <div className={`wb-option-card ${formData.heroBackgroundImage === '/assets/storefront/contact-bg.jpg' ? 'selected' : ''}`} onClick={() => setFormData({...formData, heroBackgroundImage: '/assets/storefront/contact-bg.jpg'})}>
                        <div className="wb-bg-preview" style={{ backgroundImage: 'url(/assets/storefront/contact-bg.jpg)' }}></div>
                        <strong>Lujo Urbano</strong>
                      </div>
                      <div className={`wb-option-card ${formData.heroBackgroundImage === '/assets/storefront/flota.png' ? 'selected' : ''}`} onClick={() => setFormData({...formData, heroBackgroundImage: '/assets/storefront/flota.png'})}>
                        <div className="wb-bg-preview" style={{ backgroundImage: 'url(/assets/storefront/flota.png)' }}></div>
                        <strong>Garaje Premium</strong>
                      </div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px dashed #CBD5E1' }}>
                      <label className="wb-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ImageIcon size={14} /> Subir tu propia fotografía
                      </label>
                      <ImageUpload bucket="storefront_assets" onUploadComplete={(url: string) => setFormData({ ...formData, heroBackgroundImage: url })} />
                    </div>
                  </div>

                  <div className="wb-form-group">
                    <label className="wb-label">Título Principal (Hero)</label>
                    <input type="text" className="wb-input" value={formData.heroTitle} onChange={(e) => setFormData({...formData, heroTitle: e.target.value})} />
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">Subtítulo (Hero)</label>
                    <input type="text" className="wb-input" value={formData.heroSubtitle} onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})} />
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title"><Type size={20} color="#10B981"/> Títulos de Secciones</h2>
                  <div className="wb-form-row">
                    <div className="wb-form-group">
                      <label className="wb-label">Título de Valores</label>
                      <input type="text" className="wb-input" value={formData.valuesTitle} onChange={(e) => setFormData({...formData, valuesTitle: e.target.value})} />
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Título de Flota</label>
                      <input type="text" className="wb-input" value={formData.fleetTitle} onChange={(e) => setFormData({...formData, fleetTitle: e.target.value})} />
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Título de Testimonios</label>
                      <input type="text" className="wb-input" value={formData.testimonialsTitle} onChange={(e) => setFormData({...formData, testimonialsTitle: e.target.value})} />
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Título de FAQs</label>
                      <input type="text" className="wb-input" value={formData.faqTitle} onChange={(e) => setFormData({...formData, faqTitle: e.target.value})} />
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Título de Contacto</label>
                      <input type="text" className="wb-input" value={formData.contactTitle} onChange={(e) => setFormData({...formData, contactTitle: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title">Texto "Sobre Nosotros"</h2>
                  <textarea rows={4} className="wb-input" value={formData.aboutText} onChange={(e) => setFormData({...formData, aboutText: e.target.value})} placeholder="Describe tu agencia..."></textarea>
                </div>
              </div>

              {/* SEO & CONTACT ACCORDION */}
              {renderAccordionHeader('seo', 'SEO & Contacto', <Globe size={18} />)}
              <div className={`wb-tab-content ${activeTab === 'seo' ? 'active' : ''}`}>
                <div className="wb-card">
                  <h2 className="wb-card-title"><Globe size={20} color="#F97316"/> Enlace y SEO</h2>
                  <div className="wb-form-group">
                    <label className="wb-label">URL de tu tienda pública</label>
                    <div className="wb-input-wrapper">
                      <span className="wb-input-prefix">/booking/</span>
                      <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="wb-input" placeholder="mi-agencia" />
                    </div>
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">Meta Title (SEO de Google)</label>
                    <input type="text" className="wb-input" value={formData.metaTitle} onChange={(e) => setFormData({...formData, metaTitle: e.target.value})} placeholder="Ej. Mi Agencia - Alquiler de coches en Madrid" />
                  </div>
                  <div className="wb-form-group">
                    <label className="wb-label">Meta Description (SEO)</label>
                    <textarea rows={2} className="wb-input" value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} placeholder="Breve descripción que aparecerá en los resultados de búsqueda..."></textarea>
                  </div>
                </div>

                <div className="wb-card">
                  <h2 className="wb-card-title"><Phone size={20} color="#3B82F6"/> Redes y Contacto</h2>
                  <div className="wb-form-row">
                    <div className="wb-form-group">
                      <label className="wb-label">WhatsApp (Solo números)</label>
                      <input type="text" className="wb-input" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="+34600000000" />
                    </div>
                    <div className="wb-form-group">
                      <label className="wb-label">Instagram</label>
                      <div className="wb-input-wrapper">
                        <span className="wb-input-prefix">@</span>
                        <input type="text" className="wb-input" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} placeholder="usuario" />
                      </div>
                    </div>
                    <div className="wb-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="wb-label">Facebook (URL)</label>
                      <input type="url" className="wb-input" value={formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} placeholder="https://facebook.com/..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="wb-save-wrapper">
                <button type="submit" disabled={saving} className="wb-save-btn">
                  <Save size={20} />
                  {saving ? 'Guardando configuración...' : 'Publicar Sitio Web'}
                </button>
              </div>

            </form>
          </div>

          <div className="wb-preview-col">
            <div className="wb-preview-toolbar">
              <button 
                type="button" 
                className={`wb-preview-toggle-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor size={18} /> Escritorio
              </button>
              <button 
                type="button" 
                className={`wb-preview-toggle-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone size={18} /> Móvil
              </button>
            </div>
            
            <div className={`wb-preview-canvas ${previewMode}`}>
              <div className="wb-browser-bar">
                <div className="wb-browser-dot red"></div>
                <div className="wb-browser-dot yellow"></div>
                <div className="wb-browser-dot green"></div>
              </div>
              <div 
                className="wb-phone-screen" 
                style={{ 
                  backgroundColor: '#090D16', 
                  fontFamily: `"${formData.themeFontBody}", sans-serif`,
                  overflowY: 'auto', 
                  display: 'block',
                  borderRadius: '0'
                }}
              >
                
                {/* Simulated Header */}
                <div style={{ backgroundColor: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(10px)', padding: previewMode === 'desktop' ? '20px 40px' : '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontWeight: 900, color: '#ffffff', fontSize: previewMode === 'desktop' ? '1.2rem' : '0.9rem', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}>LOGO</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white', opacity: 0.2 }}></div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white', opacity: 0.2 }}></div>
                  </div>
                </div>
                
                {/* Simulated Hero */}
                <div style={{ backgroundColor: '#090D16', backgroundImage: formData.heroBackgroundImage ? `url(${formData.heroBackgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', padding: previewMode === 'desktop' ? '100px 40px' : '50px 20px', textAlign: 'center', color: 'white', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.4) 0%, rgba(9, 13, 22, 0.95) 100%)', zIndex: 1 }}></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 
                      className="wb-editable"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setFormData({...formData, heroTitle: e.currentTarget.textContent || ''})}
                      style={{ fontFamily: `"${formData.themeFontHeading}", sans-serif`, fontSize: previewMode === 'desktop' ? '3rem' : '1.6rem', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2, color: '#ffffff' }}
                    >
                      {formData.heroTitle || 'Alquiler de Vehículos'}
                    </h2>
                    <p 
                      className="wb-editable"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setFormData({...formData, heroSubtitle: e.currentTarget.textContent || ''})}
                      style={{ color: 'rgba(255,255,255,0.8)', fontSize: previewMode === 'desktop' ? '1.1rem' : '0.85rem' }}
                    >
                      {formData.heroSubtitle || 'La mejor flota'}
                    </p>
                    <div style={{ marginTop: previewMode === 'desktop' ? '30px' : '20px' }}>
                      <span style={{ 
                        backgroundColor: primaryColor, 
                        color: '#090D16', 
                        padding: previewMode === 'desktop' ? '12px 30px' : '10px 20px', 
                        borderRadius: formData.buttonShape === 'pill' ? '20px' : formData.buttonShape === 'rounded' ? '8px' : '0px', 
                        fontSize: previewMode === 'desktop' ? '0.95rem' : '0.8rem', 
                        fontWeight: 800 
                      }}>
                        Reservar Ahora
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: previewMode === 'desktop' ? '40px' : '20px 15px', position: 'relative', zIndex: 3 }}>
                  
                  {formData.showValues && (
                    <div className={previewMode === 'desktop' ? 'canvas-grid' : ''} style={previewMode === 'mobile' ? { marginBottom: '25px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' } : { marginBottom: '40px' }}>
                      <div style={{ minWidth: '120px', backgroundColor: formData.cardColor || primaryColor, padding: '20px', borderRadius: '12px', color: '#090D16' }}>
                        <div style={{ width: 30, height: 30, backgroundColor: 'rgba(9, 13, 22, 0.1)', borderRadius: '8px', marginBottom: '10px' }}></div>
                        <strong 
                          className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, value1Title: e.currentTarget.textContent || ''})}
                          style={{ fontSize: '0.85rem', display: 'block', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}
                        >{formData.value1Title || 'Seguro Premium'}</strong>
                      </div>
                      <div style={{ minWidth: '120px', backgroundColor: formData.cardColor || primaryColor, padding: '20px', borderRadius: '12px', color: '#090D16' }}>
                        <div style={{ width: 30, height: 30, backgroundColor: 'rgba(9, 13, 22, 0.1)', borderRadius: '8px', marginBottom: '10px' }}></div>
                        <strong 
                          className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, value2Title: e.currentTarget.textContent || ''})}
                          style={{ fontSize: '0.85rem', display: 'block', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}
                        >{formData.value2Title || 'Soporte 24/7 Activo'}</strong>
                      </div>
                      <div style={{ minWidth: '120px', backgroundColor: formData.cardColor || primaryColor, padding: '20px', borderRadius: '12px', color: '#090D16', display: previewMode === 'desktop' ? 'block' : 'none' }}>
                        <div style={{ width: 30, height: 30, backgroundColor: 'rgba(9, 13, 22, 0.1)', borderRadius: '8px', marginBottom: '10px' }}></div>
                        <strong 
                          className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, value3Title: e.currentTarget.textContent || ''})}
                          style={{ fontSize: '0.85rem', display: 'block', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}
                        >{formData.value3Title || 'Entrega Flexible'}</strong>
                      </div>
                    </div>
                  )}

                  {formData.showStats && (
                    <div className={previewMode === 'desktop' ? 'canvas-grid' : ''} style={previewMode === 'mobile' ? { marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } : { marginBottom: '40px' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat1Number: e.currentTarget.textContent || ''})} style={{ fontSize: '1.5rem', fontWeight: 800, color: formData.themeColor || primaryColor }}>{formData.stat1Number || '50+'}</div>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat1Label: e.currentTarget.textContent || ''})} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{formData.stat1Label || 'Vehículos Premium'}</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat2Number: e.currentTarget.textContent || ''})} style={{ fontSize: '1.5rem', fontWeight: 800, color: formData.themeColor || primaryColor }}>{formData.stat2Number || '10k+'}</div>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat2Label: e.currentTarget.textContent || ''})} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{formData.stat2Label || 'Clientes Satisfechos'}</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', display: previewMode === 'desktop' ? 'block' : 'none' }}>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat3Number: e.currentTarget.textContent || ''})} style={{ fontSize: '1.5rem', fontWeight: 800, color: formData.themeColor || primaryColor }}>{formData.stat3Number || '99%'}</div>
                        <div className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, stat3Label: e.currentTarget.textContent || ''})} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{formData.stat3Label || 'Valoración Positiva'}</div>
                      </div>
                    </div>
                  )}

                  {formData.showAbout && formData.aboutText && (
                    <div style={{ padding: previewMode === 'desktop' ? '30px' : '15px', borderRadius: '12px', marginBottom: previewMode === 'desktop' ? '40px' : '25px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: previewMode === 'desktop' ? '1.5rem' : '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}>Sobre Nosotros</h4>
                      <div style={{ width: '30px', height: '3px', backgroundColor: primaryColor, marginBottom: '15px' }}></div>
                      <p 
                        className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, aboutText: e.currentTarget.textContent || ''})}
                        style={{ fontSize: previewMode === 'desktop' ? '0.95rem' : '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400, lineHeight: 1.6 }}
                      >
                        {formData.aboutText}
                      </p>
                    </div>
                  )}

                  <h4 style={{ fontSize: previewMode === 'desktop' ? '1.8rem' : '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}>
                    <span style={{ color: primaryColor }}>■</span> 
                    <span className="wb-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, fleetTitle: e.currentTarget.textContent || ''})}>{formData.fleetTitle || 'Nuestra Flota'}</span>
                  </h4>
                  
                  <div className="canvas-grid" style={{ display: 'grid' }}>
                    {previewVehicles.length > 0 ? previewVehicles.slice(0, previewMode === 'desktop' ? 3 : 2).map(v => (
                      <div key={v.id} style={{ backgroundColor: formData.cardColor || primaryColor, borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ height: '160px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          {v.image_url ? (
                            <img src={v.image_url} alt={v.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '2rem' }}>📸</span>
                          )}
                          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(9, 13, 22, 0.8)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>{v.daily_rate} MAD</div>
                        </div>
                        <div style={{ padding: '15px' }}>
                          <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#090D16', fontFamily: `"${formData.themeFontHeading}", sans-serif` }}>{v.brand} {v.model}</h5>
                          <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: 'rgba(9, 13, 22, 0.7)' }}>Automático • Gasolina</p>
                          <div style={{ 
                            backgroundColor: '#090D16', 
                            color: 'white', 
                            textAlign: 'center', 
                            padding: '10px', 
                            borderRadius: formData.buttonShape === 'pill' ? '20px' : formData.buttonShape === 'rounded' ? '8px' : '0px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700 
                          }}>
                            Ver Detalles
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>No hay vehículos disponibles.</p>
                    )}
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

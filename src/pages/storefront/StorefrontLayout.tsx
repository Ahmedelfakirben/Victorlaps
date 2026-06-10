import { useEffect, useState } from 'react';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Menu, X, ExternalLink, Phone } from 'lucide-react';
import './Storefront.css';

export default function StorefrontLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadAgency() {
      try {
        const { data: companies, error: agencyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', slug);

        if (agencyError) throw agencyError;
        if (!companies || companies.length === 0) {
          throw new Error('Agencia no encontrada');
        }

        setAgency(companies[0]);
      } catch (err: any) {
        console.error('Error loading agency:', err);
        setError(err.message || 'Error al cargar la página');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadAgency();
  }, [slug]);

  // Dynamic Page Title and Favicon
  useEffect(() => {
    if (agency) {
      document.title = agency.name;
      
      if (agency.logo_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = agency.logo_url;
      }
    }

    return () => {
      document.title = 'VEKTORLAPS SAAS';
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = '/logo.svg';
      }
    };
  }, [agency]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center', height: '100vh', display: 'flex' }}>
        <Loader2 size={48} className="animate-spin" color="#10b981" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404</h2>
        <p>{error || 'Agencia no encontrada'}</p>
      </div>
    );
  }

  const config = agency.storefront_config || {};
  const themePrimary = config.themeColor || '#10b981';
  const themeSecondary = config.themeSecondary || '#0F172A';
  const templateName = config.template || 'modern';

  const themeStyle = {
    '--sf-primary': themePrimary,
    '--sf-secondary': themeSecondary
  } as React.CSSProperties;

  return (
    <div className={`sf-body sf-template-${templateName}`} style={themeStyle}>
      {/* Global Navigation Header */}
      <header 
        className={`sf-header ${isScrolled ? 'scrolled' : ''}`} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0,
          right: 0,
          zIndex: 50, 
          background: isScrolled ? 'rgba(255,255,255,0.95)' : 'transparent', 
          backdropFilter: isScrolled ? 'blur(10px)' : 'none', 
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="sf-container sf-header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isScrolled ? '1rem 0' : '1.5rem 0', transition: 'padding 0.3s ease' }}>
          <Link to={`/booking/${slug}`} className="sf-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isScrolled ? 'var(--sf-secondary)' : 'white', fontSize: '1.5rem', fontWeight: 900, textDecoration: 'none', transition: 'color 0.3s ease' }}>
            {agency.logo_url && (
              <img src={agency.logo_url} alt={agency.name} style={{ height: '40px', width: 'auto', objectFit: 'contain', borderRadius: '4px' }} />
            )}
            <span>{agency.name}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="sf-desktop-nav">
            <Link to={`/booking/${slug}`} style={{ margin: '0 1rem', color: isScrolled ? '#64748B' : 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s ease' }}>Inicio</Link>
            <Link to={`/booking/${slug}/fleet`} style={{ margin: '0 1rem', color: isScrolled ? '#64748B' : 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s ease' }}>Flota</Link>
            <a href={`/booking/${slug}#nosotros`} style={{ margin: '0 1rem', color: isScrolled ? '#64748B' : 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s ease' }}>Nosotros</a>
            <a href={`/booking/${slug}#contacto`} style={{ margin: '0 1rem', color: isScrolled ? '#64748B' : 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.3s ease' }}>Contacto</a>
          </nav>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {config.whatsapp && (
              <a 
                href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hola, me gustaría contactar con ustedes.')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="sf-btn"
                style={{ 
                  backgroundColor: isScrolled ? 'var(--sf-primary)' : 'rgba(255,255,255,0.2)', 
                  color: isScrolled ? 'white' : 'white', 
                  backdropFilter: isScrolled ? 'none' : 'blur(5px)',
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '2rem', 
                  textDecoration: 'none', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  border: isScrolled ? 'none' : '1px solid rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease'
                }}
              >
                Contacta
              </a>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="sf-mobile-menu-btn" 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: isScrolled ? 'var(--sf-secondary)' : 'white', cursor: 'pointer', display: 'block', transition: 'color 0.3s ease' }}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 49 }}>
            <Link to={`/booking/${slug}`} style={{ color: 'var(--sf-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 0' }}>Inicio</Link>
            <Link to={`/booking/${slug}/fleet`} style={{ color: 'var(--sf-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 0' }}>Flota</Link>
            <a href={`/booking/${slug}#nosotros`} style={{ color: 'var(--sf-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 0' }}>Nosotros</a>
            <a href={`/booking/${slug}#contacto`} style={{ color: 'var(--sf-secondary)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 0' }}>Contacto</a>
          </div>
        )}
      </header>

      {/* Renders the specific page */}
      <Outlet context={{ agency, config }} />

      {/* Global Footer */}
      <footer className="sf-footer">
        <div className="sf-container">
          <div className="sf-footer-grid">
            <div className="sf-footer-col">
              <h3 className="sf-brand" style={{ color: 'var(--sf-secondary)', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {agency.logo_url && (
                  <img src={agency.logo_url} alt={agency.name} style={{ height: '30px', width: 'auto', objectFit: 'contain', borderRadius: '4px' }} />
                )}
                <span>{agency.name}</span>
              </h3>
              <p style={{ opacity: 0.8 }}>{config.heroSubtitle || 'La mejor opción para tu viaje.'}</p>
            </div>
            
            <div className="sf-footer-col">
              <h4>Enlaces</h4>
              <Link to={`/booking/${slug}`} className="sf-footer-link">Inicio</Link>
              <Link to={`/booking/${slug}/fleet`} className="sf-footer-link">Nuestra Flota</Link>
              <Link to={`/booking/${slug}/about`} className="sf-footer-link">Sobre Nosotros</Link>
              <Link to={`/booking/${slug}/contact`} className="sf-footer-link">Contacto</Link>
            </div>
            
            <div className="sf-footer-col">
              <h4>Horario</h4>
              <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
                Lunes - Viernes: 09:00 - 20:00<br/>
                Sábados: 10:00 - 14:00<br/>
                Domingos: Cerrado
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                {config.whatsapp && (
                  <a href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="sf-social-icon" style={{ backgroundColor: 'white', color: 'var(--sf-secondary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s', textDecoration: 'none' }}>
                    <Phone size={18} />
                  </a>
                )}
                {config.instagram && (
                  <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="sf-social-icon" style={{ backgroundColor: 'white', color: 'var(--sf-secondary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s', textDecoration: 'none' }}>
                    <ExternalLink size={18} />
                  </a>
                )}
                {config.facebook && (
                  <a href={config.facebook.startsWith('http') ? config.facebook : `https://facebook.com/${config.facebook}`} target="_blank" rel="noopener noreferrer" className="sf-social-icon" style={{ backgroundColor: 'white', color: 'var(--sf-secondary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s', textDecoration: 'none' }}>
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="sf-footer-bottom">
            <div>&copy; {new Date().getFullYear()} {agency.name}. Todos los derechos reservados.</div>
            <div style={{ color: 'var(--sf-primary)' }}>Powered by Vektorlaps OS</div>
          </div>
        </div>
      </footer>

      {/* Global Floating WhatsApp */}
      {config.whatsapp && (
        <a 
          href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir más información sobre sus alquileres.')}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="sf-floating-wa"
          title="Contáctanos por WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.956 6.551l-1.892 6.918 7.07-1.857A12 12 0 1 0 11.944 0Zm6.423 17.202c-.273.766-1.579 1.481-2.176 1.542-.566.059-1.298.243-4.15-1.025-3.447-1.534-5.69-5.328-5.864-5.578-.172-.25-1.396-1.884-1.396-3.593s.885-2.552 1.189-2.887c.304-.333.662-.416.883-.416.22 0 .441.002.636.011.205.01.482-.08.753.56.28.665.952 2.378 1.036 2.548.084.17.14.368.028.59-.111.222-.167.362-.336.561-.167.198-.352.428-.5.573-.162.16-.33.336-.145.666.185.33 .824 1.401 1.764 2.261 1.215 1.111 2.254 1.458 2.585 1.62.332.162.525.132.723-.092.198-.224.856-1.018 1.085-1.368.229-.35.457-.291.758-.176.303.114 1.916.924 2.247 1.093.33.169.551.254.633.394.084.14.084.814-.189 1.58z"/>
          </svg>
        </a>
      )}
    </div>
  );
}

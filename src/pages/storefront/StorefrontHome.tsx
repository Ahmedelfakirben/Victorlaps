import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Car, Loader2, Users, Fuel, Settings, ShieldCheck, Clock, MapPin } from 'lucide-react';
import './Storefront.css';

export default function StorefrontHome() {
  const { slug } = useParams();
  const [agency, setAgency] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStorefront() {
      try {
        const { data: companies, error: agencyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', slug);

        if (agencyError) throw agencyError;
        if (!companies || companies.length === 0) {
          throw new Error('Agencia no encontrada');
        }

        const currentAgency = companies[0];
        setAgency(currentAgency);

        const { data: fleet, error: fleetError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', currentAgency.id)
          .eq('status', 'available');

        if (fleetError) throw fleetError;
        setVehicles(fleet || []);

      } catch (err: any) {
        console.error('Error loading storefront:', err);
        setError(err.message || 'Error al cargar la página');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadStorefront();
  }, [slug]);

  if (loading) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="#10b981" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h1>
          <p>{error || 'Página no encontrada'}</p>
        </div>
      </div>
    );
  }

  const config = agency.storefront_config || {};
  const themePrimary = config.themeColor || '#10b981';
  const themeSecondary = config.themeSecondary || '#0F172A';
  const templateName = config.template || 'modern';

  // Inject CSS variables
  const themeStyle = {
    '--sf-primary': themePrimary,
    '--sf-secondary': themeSecondary
  } as React.CSSProperties;

  return (
    <div className={`sf-body sf-template-${templateName}`} style={themeStyle}>
      {/* Header Público */}
      <header className="sf-header">
        <div className="sf-container sf-header-content">
          <Link to={`/booking/${slug}`} className="sf-brand">
            {agency.name}
          </Link>
          <div className="sf-nav-social">
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="sf-social-icon">
                <MessageCircle size={20} />
              </a>
            )}
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="sf-social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {config.facebook && (
              <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="sf-social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="sf-hero">
        <div className="sf-container sf-hero-content">
          <h2 className="sf-hero-title">
            {config.heroTitle || 'Alquiler de Vehículos'}
          </h2>
          <p className="sf-hero-subtitle">
            {config.heroSubtitle || 'La mejor flota al mejor precio'}
          </p>
        </div>
      </div>

      <main>
        {/* Values Section */}
        <div className="sf-values">
          <div className="sf-container">
            <div className="sf-values-grid">
              <div className="sf-value-item">
                <div className="sf-value-icon">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="sf-value-title">Seguro a Todo Riesgo</h4>
                <p className="sf-value-text">Viaja con total tranquilidad gracias a nuestra cobertura premium incluida.</p>
              </div>
              <div className="sf-value-item">
                <div className="sf-value-icon">
                  <Clock size={32} />
                </div>
                <h4 className="sf-value-title">Soporte 24/7</h4>
                <p className="sf-value-text">Asistencia en carretera y atención al cliente a cualquier hora del día.</p>
              </div>
              <div className="sf-value-item">
                <div className="sf-value-icon">
                  <MapPin size={32} />
                </div>
                <h4 className="sf-value-title">Múltiples Ubicaciones</h4>
                <p className="sf-value-text">Recoge y devuelve tu vehículo en cualquiera de nuestras sucursales o aeropuerto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {config.aboutText && (
          <div className="sf-about">
            <div className="sf-container">
              <h3 className="sf-about-title">Sobre Nosotros</h3>
              <div className="sf-divider"></div>
              <p className="sf-about-text">
                {config.aboutText}
              </p>
            </div>
          </div>
        )}

        {/* Fleet Section */}
        <div className="sf-fleet">
          <div className="sf-container">
            <h3 className="sf-section-title">
              <Car size={36} />
              Nuestra Flota Disponible
            </h3>
            
            {vehicles.length === 0 ? (
              <div className="sf-empty">
                <Car size={48} />
                <p>No hay vehículos disponibles en este momento.</p>
              </div>
            ) : (
              <div className="sf-grid">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="sf-card">
                    <div className="sf-card-image">
                      {vehicle.image_url ? (
                        <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />
                      ) : (
                        <Car size={64} color="#CBD5E1" />
                      )}
                      <div className="sf-card-price">
                        {vehicle.daily_rate} MAD <span>/día</span>
                      </div>
                    </div>
                    <div className="sf-card-content">
                      <h4 className="sf-card-title">{vehicle.brand} {vehicle.model}</h4>
                      <p className="sf-card-subtitle">Año {vehicle.year}</p>
                      
                      <div className="sf-card-specs">
                        <div className="sf-spec">
                          <Settings size={16} />
                          {vehicle.transmission}
                        </div>
                        <div className="sf-spec">
                          <Fuel size={16} />
                          {vehicle.fuel}
                        </div>
                        <div className="sf-spec">
                          <Users size={16} />
                          {vehicle.seats || 5} Plazas
                        </div>
                      </div>

                      <Link to={`/booking/${slug}/vehicle/${vehicle.id}`} className="sf-btn">
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modern Premium Footer */}
      <footer className="sf-footer">
        <div className="sf-container">
          <div className="sf-footer-grid">
            <div className="sf-footer-col">
              <h4>{agency.name}</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                {config.heroSubtitle || 'La mejor flota al mejor precio.'} Tu agencia de confianza para el alquiler de vehículos.
              </p>
            </div>
            
            <div className="sf-footer-col">
              <h4>Contacto Rápidoy Redes</h4>
              <div className="sf-footer-links">
                {config.whatsapp && (
                  <a href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="sf-footer-link">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}
                {config.instagram && (
                  <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="sf-footer-link">
                    Instagram
                  </a>
                )}
                {config.facebook && (
                  <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="sf-footer-link">
                    Facebook
                  </a>
                )}
              </div>
            </div>

            <div className="sf-footer-col">
              <h4>Horario</h4>
              <div className="sf-footer-links">
                <div className="sf-footer-link">Lunes a Viernes: 09:00 - 19:00</div>
                <div className="sf-footer-link">Sábado: 09:00 - 14:00</div>
                <div className="sf-footer-link">Domingo: Cerrado</div>
              </div>
            </div>
          </div>
          
          <div className="sf-footer-bottom">
            <div>&copy; {new Date().getFullYear()} {agency.name}. Todos los derechos reservados.</div>
            <div style={{ color: 'var(--sf-primary)' }}>Powered by Vektorlaps OS</div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
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

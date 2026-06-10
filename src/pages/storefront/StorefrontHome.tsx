import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Car, Loader2, Users, Fuel, Settings, ShieldCheck, Clock, MapPin, MessageCircle } from 'lucide-react';
import './Storefront.css';

export default function StorefrontHome() {
  const { slug } = useParams();
  const { agency, config } = useOutletContext<any>();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFleet() {
      try {
        const { data: fleet, error: fleetError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', agency.id)
          .eq('status', 'available');

        if (fleetError) throw fleetError;
        setVehicles(fleet || []);
      } catch (err: any) {
        console.error('Error loading fleet:', err);
      } finally {
        setLoading(false);
      }
    }

    if (agency?.id) {
      loadFleet();
    }
  }, [agency?.id]);

  if (loading) {
    return (
      <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: '50vh' }}>
        <Loader2 size={48} className="animate-spin" color="var(--sf-primary)" />
      </div>
    );
  }

  const heroStyle = config.heroBackgroundImage ? {
    backgroundImage: `url(${config.heroBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  return (
    <>
      <section className="sf-hero" style={heroStyle}>
        {config.heroBackgroundImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1 }}></div>
        )}
        <div className="sf-container sf-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="sf-hero-title">
            {config.heroTitle || 'Alquiler de Vehículos'}
          </h2>
          <p className="sf-hero-subtitle">
            {config.heroSubtitle || 'La mejor flota al mejor precio'}
          </p>
        </div>
      </section>

      <main>
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

        {config.aboutText && (
          <div className="sf-about" id="nosotros">
            <div className="sf-container">
              <h3 className="sf-about-title">Sobre Nosotros</h3>
              <div className="sf-divider"></div>
              <p className="sf-about-text">
                {config.aboutText}
              </p>
            </div>
          </div>
        )}

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

        {/* Contacto Section */}
        <div id="contacto" style={{ padding: '5rem 0', backgroundColor: '#F8FAFC' }}>
          <div className="sf-container">
            <h3 className="sf-section-title">
              <MessageCircle /> Contacto Directo
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
              <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <MessageCircle size={32} />
                </div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1E293B' }}>WhatsApp</h4>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Reserva rápida y directa.</p>
                {config.whatsapp && (
                  <a 
                    href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir información.')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="sf-btn"
                    style={{ backgroundColor: '#25D366', color: 'white', width: '100%', display: 'flex', justifyContent: 'center' }}
                  >
                    Escríbenos ahora
                  </a>
                )}
              </div>
              <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <MapPin size={32} />
                </div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1E293B' }}>Ubicación</h4>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>{agency.name}</p>
                <div className="sf-btn" style={{ backgroundColor: 'var(--sf-secondary)', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'default' }}>
                  Sede Principal
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

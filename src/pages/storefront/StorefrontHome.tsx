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

  useEffect(() => {
    if (loading) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

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
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.4) 0%, rgba(9, 13, 22, 0.7) 100%)', zIndex: 1 }}></div>
        )}
        <div className="sf-container sf-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="sf-hero-title">
            {config.heroTitle || 'Alquiler de Vehículos'}
          </h2>
          <p className="sf-hero-subtitle">
            {config.heroSubtitle || 'La mejor flota al mejor precio'}
          </p>
          <div style={{ marginTop: '2.5rem' }}>
            <Link to={`/booking/${slug}/fleet`} className="sf-btn" style={{ display: 'inline-flex', padding: '0.85rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
              Réservez maintenant
            </Link>
          </div>
        </div>
      </section>

      <main className="sf-main-content">
        {/* Core Values Section */}
        {config.showValues !== false && (
          <section className="sf-values reveal">
            <div className="sf-container">
              {config.valuesTitle && <h3 className="sf-section-title-center" style={{ marginBottom: '2rem' }}>{config.valuesTitle}</h3>}
              <div className="sf-values-grid">
                <div className="sf-value-item">
                  <div className="sf-value-icon">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="sf-value-title">{config.value1Title || 'Seguro Premium'}</h4>
                  <p className="sf-value-text">{config.value1Text || 'Viaja con total tranquilidad gracias a nuestra cobertura a todo riesgo premium incluida.'}</p>
                </div>
                <div className="sf-value-item">
                  <div className="sf-value-icon">
                    <Clock size={32} />
                  </div>
                  <h4 className="sf-value-title">{config.value2Title || 'Soporte 24/7 Activo'}</h4>
                  <p className="sf-value-text">{config.value2Text || 'Asistencia en carretera y atención al cliente dedicada en cualquier momento de tu viaje.'}</p>
                </div>
                <div className="sf-value-item">
                  <div className="sf-value-icon">
                    <MapPin size={32} />
                  </div>
                  <h4 className="sf-value-title">{config.value3Title || 'Entrega Flexible'}</h4>
                  <p className="sf-value-text">{config.value3Text || 'Recogida y devolución a medida en aeropuerto, hotel o cualquiera de nuestras oficinas.'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Enriched Stats Section */}
        {config.showStats !== false && (
          <section className="sf-stats-section reveal">
            <div className="sf-container">
              <div className="sf-stats-grid">
                <div className="sf-stat-card">
                  <span className="sf-stat-number">{config.stat1Number || '50+'}</span>
                  <span className="sf-stat-label">{config.stat1Label || 'Vehículos Premium'}</span>
                </div>
                <div className="sf-stat-card">
                  <span className="sf-stat-number">{config.stat2Number || '10k+'}</span>
                  <span className="sf-stat-label">{config.stat2Label || 'Clientes Satisfechos'}</span>
                </div>
                <div className="sf-stat-card">
                  <span className="sf-stat-number">{config.stat3Number || '99%'}</span>
                  <span className="sf-stat-label">{config.stat3Label || 'Valoración Positiva'}</span>
                </div>
                <div className="sf-stat-card">
                  <span className="sf-stat-number">{config.stat4Number || '24h'}</span>
                  <span className="sf-stat-label">{config.stat4Label || 'Soporte Express'}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How it Works / Process Section */}
        <section className="sf-process-section reveal">
          <div className="sf-container">
            <div className="sf-section-header">
              <h3 className="sf-section-title-center">Cómo Alquilar en 3 Pasos</h3>
              <p className="sf-section-subtitle-center">Nuestro proceso es rápido, transparente y 100% digital</p>
            </div>
            
            <div className="sf-process-grid">
              <div className="sf-process-step">
                <div className="sf-step-badge">1</div>
                <h4 className="sf-step-title">Elige tu Vehículo</h4>
                <p className="sf-step-desc">Explora nuestra colección y selecciona el coche que mejor se adapte a tus necesidades y presupuesto.</p>
              </div>
              <div className="sf-process-step">
                <div className="sf-step-badge">2</div>
                <h4 className="sf-step-title">Define Fechas y Reserva</h4>
                <p className="sf-step-desc">Elige los días de recogida y devolución. Mándanos una solicitud instantánea vía WhatsApp sin compromiso.</p>
              </div>
              <div className="sf-process-step">
                <div className="sf-step-badge">3</div>
                <h4 className="sf-step-title">Recoge y Disfruta</h4>
                <p className="sf-step-desc">Preparamos el contrato rápido y te entregamos el coche impecable para que empieces a disfrutar de tu viaje.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fleet Section */}
        <section className="sf-fleet reveal">
          <div className="sf-container">
            <h3 className="sf-section-title">
              <Car size={36} />
              {config.fleetTitle || 'Nuestra Flota Disponible'}
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
        </section>

        {/* About Section */}
        {config.showAbout !== false && config.aboutText && (
          <section className="sf-about reveal" id="nosotros">
            <div className="sf-container">
              <h3 className="sf-about-title">Sobre Nosotros</h3>
              <div className="sf-divider"></div>
              <p className="sf-about-text">
                {config.aboutText}
              </p>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {config.showTestimonials !== false && (
          <section className="sf-testimonials-section reveal">
            <div className="sf-container">
              <div className="sf-section-header">
                <h3 className="sf-section-title-center">{config.testimonialsTitle || 'Opiniones de Nuestros Clientes'}</h3>
                <p className="sf-section-subtitle-center">Lo que dicen los viajeros que confían en nosotros</p>
              </div>

              <div className="sf-testimonials-grid">
                <div className="sf-testimonial-card">
                  <div className="sf-stars">★★★★★</div>
                  <p className="sf-testimonial-text">"Excelente servicio. Reservé a través de WhatsApp en pocos minutos y el coche estaba listo y limpísimo en el aeropuerto. Totalmente recomendado."</p>
                  <div className="sf-testimonial-author">
                    <div className="sf-author-avatar">Y.B.</div>
                    <div>
                      <h5 className="sf-author-name">Yassine B.</h5>
                      <span className="sf-author-role">Cliente Verificado</span>
                    </div>
                  </div>
                </div>

                <div className="sf-testimonial-card">
                  <div className="sf-stars">★★★★★</div>
                  <p className="sf-testimonial-text">"Trato muy profesional e inmejorable relación calidad-precio. Tuvimos un pequeño contratiempo con nuestro vuelo y nos esperaron sin ningún cargo extra."</p>
                  <div className="sf-testimonial-author">
                    <div className="sf-author-avatar">M.D.</div>
                    <div>
                      <h5 className="sf-author-name">Marie D.</h5>
                      <span className="sf-author-role">Cliente de Negocios</span>
                    </div>
                  </div>
                </div>

                <div className="sf-testimonial-card">
                  <div className="sf-stars">★★★★★</div>
                  <p className="sf-testimonial-text">"El coche estaba en perfectas condiciones y el seguro a todo riesgo nos dio mucha tranquilidad para recorrer el país. Repetiremos sin duda."</p>
                  <div className="sf-testimonial-author">
                    <div className="sf-author-avatar">A.K.</div>
                    <div>
                      <h5 className="sf-author-name">Ahmed K.</h5>
                      <span className="sf-author-role">Viajero Frecuente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {config.showFaq !== false && (
          <section className="sf-faqs-section reveal">
            <div className="sf-container">
              <div className="sf-section-header">
                <h3 className="sf-section-title-center">{config.faqTitle || 'Preguntas Frecuentes'}</h3>
                <p className="sf-section-subtitle-center">Todo lo que necesitas saber antes de tu alquiler</p>
              </div>

              <div className="sf-faqs-list">
                <details className="sf-faq-item">
                  <summary className="sf-faq-question">¿Qué documentos necesito para recoger el vehículo?</summary>
                  <div className="sf-faq-answer">
                    <p>Necesitarás presentar tu documento de identidad (DNI o Pasaporte) en vigor, un permiso de conducir válido y vigente, y una tarjeta de crédito/débito a nombre del conductor principal.</p>
                  </div>
                </details>

                <details className="sf-faq-item">
                  <summary className="sf-faq-question">¿El seguro a todo riesgo tiene franquicia?</summary>
                  <div className="sf-faq-answer">
                    <p>Nuestra tarifa premium incluye cobertura a todo riesgo. Dependiendo del coche seleccionado, puede existir una franquicia mínima garantizada que se detalla en el momento de la confirmación de la reserva.</p>
                  </div>
                </details>

                <details className="sf-faq-item">
                  <summary className="sf-faq-question">¿Puedo cancelar o modificar mi reserva?</summary>
                  <div className="sf-faq-answer">
                    <p>¡Sí! Las cancelaciones y modificaciones son totalmente gratuitas si se avisa con al menos 24 horas de antelación. Simplemente ponte en contacto con nosotros a través de WhatsApp o llamada telefónica.</p>
                  </div>
                </details>

                <details className="sf-faq-item">
                  <summary className="sf-faq-question">¿Cómo se realiza el pago del alquiler?</summary>
                  <div className="sf-faq-answer">
                    <p>El pago se realiza cómodamente en el momento de la recogida del vehículo, ya sea en efectivo, con tarjeta de crédito o mediante transferencia garantizada.</p>
                  </div>
                </details>
              </div>
            </div>
          </section>
        )}

        {/* Contacto Section */}
        <section id="contacto" className="sf-contact-section reveal">
          <div className="sf-container">
            <h3 className="sf-section-title">
              <MessageCircle /> {config.contactTitle || 'Contacto Directo'}
            </h3>
            <div className="sf-contact-grid">
              <div className="sf-contact-card">
                <div className="sf-contact-icon-wrapper">
                  <MessageCircle size={32} />
                </div>
                <h4 className="sf-contact-card-title">WhatsApp</h4>
                <p className="sf-contact-card-desc">Reserva rápida y directa directamente con nuestro equipo.</p>
                {config.whatsapp && (
                  <a 
                    href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir información.')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="sf-btn sf-btn-whatsapp-direct"
                  >
                    Escríbenos ahora
                  </a>
                )}
              </div>
              <div className="sf-contact-card">
                <div className="sf-contact-icon-wrapper secondary-wrapper">
                  <MapPin size={32} />
                </div>
                <h4 className="sf-contact-card-title">Ubicación</h4>
                <p className="sf-contact-card-desc">{agency.name}</p>
                <div className="sf-btn sf-btn-location-direct">
                  Sede Principal
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

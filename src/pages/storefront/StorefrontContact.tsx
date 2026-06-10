import { useOutletContext } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Clock } from 'lucide-react';
import './Storefront.css';

export default function StorefrontContact() {
  const { agency, config } = useOutletContext<any>();

  return (
    <main style={{ minHeight: '80vh', padding: '6rem 0 0 0' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.4) 0%, rgba(9, 13, 22, 0.6) 100%)', color: 'white', padding: '6rem 2rem', textAlign: 'center', borderBottom: '1px solid var(--sf-border-glass)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Contacto</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--sf-primary)' }}>Estamos aquí para ayudarte</p>
      </div>

      <div className="sf-container" style={{ padding: '4rem 0' }}>
        <div className="sf-contact-grid" style={{ marginTop: 0 }}>
          
          <div className="sf-contact-card">
            <div className="sf-contact-icon-wrapper">
              <MessageCircle size={32} />
            </div>
            <h3 className="sf-contact-card-title">WhatsApp Directo</h3>
            <p className="sf-contact-card-desc">La forma más rápida de contactarnos para reservas y disponibilidad.</p>
            {config.whatsapp ? (
              <a 
                href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="sf-btn sf-btn-whatsapp-direct"
              >
                <MessageCircle size={20} /> Escríbenos ahora
              </a>
            ) : (
              <span style={{ color: 'var(--sf-text-muted)' }}>No configurado</span>
            )}
          </div>

          <div className="sf-contact-card">
            <div className="sf-contact-icon-wrapper secondary-wrapper">
              <Phone size={32} />
            </div>
            <h3 className="sf-contact-card-title">Llámanos</h3>
            <p className="sf-contact-card-desc">Atención telefónica en horario comercial.</p>
            {config.whatsapp ? (
              <a 
                href={`tel:${config.whatsapp.replace(/\+/g, '')}`} 
                className="sf-btn"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Phone size={20} /> Llamar ahora
              </a>
            ) : (
              <span style={{ color: 'var(--sf-text-muted)' }}>No configurado</span>
            )}
          </div>

        </div>

        <div className="sf-testimonial-card" style={{ marginTop: '3rem', alignItems: 'stretch' }}>
          <h3 className="sf-contact-card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Ubicación y Horario</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <MapPin color="var(--sf-primary)" size={32} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>Sede Principal</h4>
              <p style={{ color: 'var(--sf-text-muted)' }}>{agency.name}</p>
            </div>
            <div>
              <Clock color="var(--sf-primary)" size={32} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>Horario</h4>
              <p style={{ color: 'var(--sf-text-muted)', lineHeight: '1.6' }}>
                Lunes - Viernes: 09:00 - 20:00<br />
                Sábados: 10:00 - 14:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

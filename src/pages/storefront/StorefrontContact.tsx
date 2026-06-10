import { useOutletContext } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Clock } from 'lucide-react';
import './Storefront.css';

export default function StorefrontContact() {
  const { agency, config } = useOutletContext<any>();

  return (
    <main style={{ minHeight: '80vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ backgroundColor: 'var(--sf-secondary)', color: 'white', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Contacto</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--sf-primary)' }}>Estamos aquí para ayudarte</p>
      </div>

      <div className="sf-container" style={{ padding: '4rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <MessageCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1E293B' }}>WhatsApp Directo</h3>
            <p style={{ color: '#64748B', marginBottom: '2rem' }}>La forma más rápida de contactarnos para reservas y disponibilidad.</p>
            {config.whatsapp ? (
              <a 
                href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="sf-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#25D366', color: 'white' }}
              >
                <MessageCircle size={20} /> Escríbenos ahora
              </a>
            ) : (
              <span style={{ color: '#94A3B8' }}>No configurado</span>
            )}
          </div>

          <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Phone size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1E293B' }}>Llámanos</h3>
            <p style={{ color: '#64748B', marginBottom: '2rem' }}>Atención telefónica en horario comercial.</p>
            {config.whatsapp ? (
              <a 
                href={`tel:${config.whatsapp.replace(/\+/g, '')}`} 
                className="sf-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--sf-secondary)', color: 'white' }}
              >
                <Phone size={20} /> Llamar ahora
              </a>
            ) : (
              <span style={{ color: '#94A3B8' }}>No configurado</span>
            )}
          </div>

        </div>

        <div style={{ marginTop: '3rem', backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1E293B', textAlign: 'center' }}>Ubicación y Horario</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <MapPin color="var(--sf-primary)" size={32} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 600, color: '#1E293B' }}>Sede Principal</h4>
              <p style={{ color: '#64748B' }}>{agency.name}</p>
            </div>
            <div>
              <Clock color="var(--sf-primary)" size={32} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 600, color: '#1E293B' }}>Horario</h4>
              <p style={{ color: '#64748B' }}>
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

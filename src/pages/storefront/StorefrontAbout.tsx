import { useOutletContext } from 'react-router-dom';
import { Users, ShieldCheck, Clock, MapPin } from 'lucide-react';
import './Storefront.css';

export default function StorefrontAbout() {
  const { agency, config } = useOutletContext<any>();

  return (
    <main style={{ minHeight: '80vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ backgroundColor: 'var(--sf-secondary)', color: 'white', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Sobre {agency.name}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--sf-primary)' }}>Nuestra historia y valores</p>
      </div>

      <div className="sf-container" style={{ padding: '4rem 0' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--sf-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users color="var(--sf-primary)" /> Quiénes Somos
          </h2>
          
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#475569' }}>
            {config.aboutText ? (
              <p style={{ whiteSpace: 'pre-wrap' }}>{config.aboutText}</p>
            ) : (
              <p>Somos una agencia de alquiler de vehículos comprometida con ofrecer la mejor experiencia a nuestros clientes. Nuestra flota moderna y nuestro servicio de atención al cliente nos distinguen.</p>
            )}
          </div>
        </div>
      </div>

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
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Car, Calendar, Settings, Fuel, Users, MessageCircle, Loader2 } from 'lucide-react';
import './Storefront.css';

export default function StorefrontVehicle() {
  const { slug, id } = useParams();
  const [agency, setAgency] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadVehicleDetails() {
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
          .eq('id', id)
          .eq('company_id', currentAgency.id);

        if (fleetError) throw fleetError;
        if (!fleet || fleet.length === 0) {
          throw new Error('Vehículo no encontrado');
        }

        setVehicle(fleet[0]);

      } catch (err: any) {
        console.error('Error loading vehicle:', err);
        setError(err.message || 'Error al cargar los detalles');
      } finally {
        setLoading(false);
      }
    }

    if (slug && id) loadVehicleDetails();
  }, [slug, id]);

  if (loading) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="#10b981" />
      </div>
    );
  }

  if (error || !agency || !vehicle) {
    return (
      <div className="sf-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h1>
          <p>{error || 'Página no encontrada'}</p>
          <Link to={`/booking/${slug}`} style={{ color: '#10b981', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
            Volver al inicio
          </Link>
        </div>
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

  // Generate WhatsApp message
  const whatsappNumber = config.whatsapp ? config.whatsapp.replace(/\+/g, '') : '';
  const message = `Hola ${agency.name}, estoy interesado en alquilar el vehículo: ${vehicle.brand} ${vehicle.model} (${vehicle.year}). ¿Está disponible?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className={`sf-body sf-template-${templateName}`} style={themeStyle}>
      {/* Simple Header */}
      <header className="sf-header">
        <div className="sf-container sf-header-content">
          <Link to={`/booking/${slug}`} className="sf-brand">
            {agency.name}
          </Link>
        </div>
      </header>

      {/* Hero Detail */}
      <div className="sf-detail-hero">
        <div className="sf-container">
          <Link to={`/booking/${slug}`} className="sf-back-btn">
            <ArrowLeft size={20} /> Volver a la flota
          </Link>
          <h1 className="sf-hero-title" style={{ margin: 0, textAlign: 'left' }}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0' }}>
            Año {vehicle.year}
          </p>
        </div>
      </div>

      <main className="sf-container" style={{ flex: 1 }}>
        <div className="sf-detail-grid">
          {/* Image Gallery */}
          <div className="sf-detail-image">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />
            ) : (
              <Car size={120} color="#CBD5E1" />
            )}
          </div>

          {/* Info Sidebar */}
          <div className="sf-detail-info">
            <div className="sf-detail-price">
              {vehicle.daily_rate} MAD <span>/ día</span>
            </div>

            <div className="sf-divider" style={{ margin: '1.5rem 0', width: '100%' }}></div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--sf-secondary)' }}>
              Características
            </h3>

            <div className="sf-specs-list">
              <div className="sf-spec-item">
                <span className="sf-spec-label"><Calendar size={20} /> Año</span>
                <span>{vehicle.year}</span>
              </div>
              <div className="sf-spec-item">
                <span className="sf-spec-label"><Settings size={20} /> Transmisión</span>
                <span>{vehicle.transmission}</span>
              </div>
              <div className="sf-spec-item">
                <span className="sf-spec-label"><Fuel size={20} /> Combustible</span>
                <span>{vehicle.fuel}</span>
              </div>
              <div className="sf-spec-item">
                <span className="sf-spec-label"><Users size={20} /> Pasajeros</span>
                <span>{vehicle.seats || 5} Plazas</span>
              </div>
            </div>

            {whatsappNumber ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-whatsapp">
                <MessageCircle size={24} />
                Solicitar Reserva por WhatsApp
              </a>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '0.75rem', color: '#64748B' }}>
                <p style={{ margin: 0 }}>La agencia no tiene WhatsApp configurado.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sf-footer">
        <div className="sf-container">
          <div className="sf-footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div>&copy; {new Date().getFullYear()} {agency.name}. Todos los derechos reservados.</div>
            <div style={{ color: 'var(--sf-primary)' }}>Powered by Vektorlaps OS</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Car, Calendar, Settings, Fuel, Users, Loader2 } from 'lucide-react';

export default function StorefrontVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agency, config } = useOutletContext<any>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Date Picker State
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');

  useEffect(() => {
    async function loadVehicle() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setVehicle(data);
      } catch (err) {
        console.error('Error loading vehicle:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadVehicle();
  }, [id]);

  if (loading) {
    return (
      <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: '50vh' }}>
        <Loader2 size={48} className="animate-spin" color="var(--sf-primary)" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2>Vehículo no encontrado</h2>
        <button onClick={() => navigate(-1)} className="sf-btn" style={{ marginTop: '1rem' }}>Volver</button>
      </div>
    );
  }

  // Generate WhatsApp message with Dates
  const whatsappNumber = config.whatsapp ? config.whatsapp.replace(/\+/g, '') : '';
  let messageText = `Hola ${agency.name}, estoy interesado en alquilar el vehículo: ${vehicle.brand} ${vehicle.model} (${vehicle.year}).`;
  if (pickupDate && dropoffDate) {
    messageText += `\nFechas: Desde el ${pickupDate} hasta el ${dropoffDate}.`;
  }
  messageText += `\n¿Está disponible?`;
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <main>
      <div 
        className="sf-detail-hero" 
        style={vehicle.image_url ? {
          backgroundImage: `linear-gradient(to bottom, rgba(9, 13, 22, 0.4) 0%, rgba(9, 13, 22, 0.95) 100%), url(${vehicle.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          padding: '8rem 0 5rem 0'
        } : undefined}
      >
        <div className="sf-container">
          <button onClick={() => navigate(-1)} className="sf-back-btn" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, padding: 0, marginBottom: '1rem' }}>
            <ArrowLeft size={20} /> Volver a la flota
          </button>
          <h1 className="sf-hero-title" style={{ margin: 0, textAlign: 'left' }}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0' }}>
            Año {vehicle.year}
          </p>
        </div>
      </div>

      <div className="sf-container" style={{ padding: '2rem 0' }}>
        <div className="sf-detail-grid">
          <div className="sf-detail-image">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />
            ) : (
              <Car size={120} color="#CBD5E1" />
            )}
          </div>

          <div className="sf-detail-info">
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

            <div className="sf-detail-sidebar">
              <div className="sf-detail-price">
                <div className="sf-detail-price-amount">{vehicle.daily_rate} MAD</div>
                <div className="sf-detail-price-label">Por día</div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1E293B', fontWeight: 600 }}>
                  <Calendar size={20} color="var(--sf-primary)" /> Fechas de Reserva
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem', fontWeight: 600 }}>Recogida</label>
                    <input 
                      type="date" 
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem', fontWeight: 600 }}>Devolución</label>
                    <input 
                      type="date" 
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      min={pickupDate}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '1rem' }}
                    />
                  </div>
                </div>
              </div>

              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="sf-btn"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', fontSize: '1.1rem', marginTop: '1.5rem' }}
              >
                Solicitar Reserva por WhatsApp
              </a>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginTop: '1rem' }}>
                Sin compromiso. El pago se realiza al recoger el vehículo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

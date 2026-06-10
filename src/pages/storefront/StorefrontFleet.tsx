import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Car, Fuel, Users, Loader2, Settings } from 'lucide-react';
import './Storefront.css';

export default function StorefrontFleet() {
  const { slug } = useParams();
  const { agency } = useOutletContext<any>();
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

    if (agency?.id) loadFleet();
  }, [agency?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <Loader2 size={48} className="animate-spin" color="var(--sf-primary)" />
      </div>
    );
  }

  return (
    <main style={{ padding: '6rem 0 4rem 0', minHeight: '80vh' }}>
      <div className="sf-container">
        <h2 className="sf-section-title" style={{ justifyContent: 'flex-start', marginBottom: '3rem' }}>
          <Car /> Nuestra Colección Completa
        </h2>

        {vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem' }}>
            <Car size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#64748B' }}>No hay vehículos disponibles en este momento.</h3>
          </div>
        ) : (
          <div className="sf-grid">
            {vehicles.map((v) => (
              <Link to={`/booking/${slug}/vehicle/${v.id}`} key={v.id} className="sf-card" style={{ textDecoration: 'none' }}>
                <div className="sf-card-image">
                  {v.image_url ? (
                    <img src={v.image_url} alt={`${v.brand} ${v.model}`} />
                  ) : (
                    <Car size={48} color="#CBD5E1" />
                  )}
                  <div className="sf-card-price">
                    {v.daily_rate} MAD <span>/ día</span>
                  </div>
                </div>
                
                <div className="sf-card-content">
                  <h4 className="sf-card-title">{v.brand} {v.model}</h4>
                  <div className="sf-card-subtitle">{v.year}</div>
                  
                  <div className="sf-card-specs">
                    <div className="sf-spec">
                      <Settings size={16} /> {v.transmission}
                    </div>
                    <div className="sf-spec">
                      <Fuel size={16} /> {v.fuel}
                    </div>
                    <div className="sf-spec">
                      <Users size={16} /> 5
                    </div>
                  </div>
                  
                  <div className="sf-btn" style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                    Ver Detalles
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

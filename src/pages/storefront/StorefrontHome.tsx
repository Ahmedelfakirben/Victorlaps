import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Car, Loader2 } from 'lucide-react';

export default function StorefrontHome() {
  const { slug } = useParams();
  const [agency, setAgency] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStorefront() {
      try {
        // 1. Fetch agency by slug
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

        // 2. Fetch available vehicles for this agency
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Página no encontrada'}</p>
        </div>
      </div>
    );
  }

  const config = agency.storefront_config || {};
  const themeColor = config.themeColor || '#10b981';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Público */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: themeColor }}>
            {agency.name}
          </h1>
          <div className="flex space-x-4">
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500">
                <MessageCircle className="w-6 h-6" />
              </a>
            )}
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {config.facebook && (
              <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div 
        className="relative py-24 px-4 sm:px-6 lg:px-8 text-center text-white"
        style={{ backgroundColor: themeColor }}
      >
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {config.heroTitle || 'Alquiler de Vehículos'}
          </h2>
          <p className="text-xl sm:text-2xl text-white/90">
            {config.heroSubtitle || 'La mejor flota al mejor precio'}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        {config.aboutText && (
          <div className="mb-16 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sobre Nosotros</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {config.aboutText}
            </p>
          </div>
        )}

        {/* Fleet Section */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Car className="w-8 h-8 mr-3" style={{ color: themeColor }} />
            Nuestra Flota Disponible
          </h3>
          
          {vehicles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">No hay vehículos disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                    {vehicle.image_url ? (
                      <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-16 h-16 text-gray-300" />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm text-gray-900">
                      {vehicle.daily_rate} MAD <span className="text-gray-500 text-xs font-normal">/día</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                        <p className="text-gray-500">{vehicle.year}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600 flex-grow">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: themeColor }}></div>
                        {vehicle.transmission}
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: themeColor }}></div>
                        {vehicle.fuel}
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: themeColor }}></div>
                        {vehicle.seats} Plazas
                      </div>
                    </div>

                    <Link 
                      to={`/booking/${slug}/vehicle/${vehicle.id}`}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: themeColor }}
                    >
                      Ver Detalles y Reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} {agency.name}. Todos los derechos reservados.</p>
          <p className="text-gray-600 text-sm mt-2">Powered by Vektorlaps OS</p>
        </div>
      </footer>
    </div>
  );
}

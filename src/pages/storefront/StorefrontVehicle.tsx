import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Car, Calendar, Settings, Fuel, Users, Check, MessageCircle, Loader2 } from 'lucide-react';

export default function StorefrontVehicle() {
  const { slug, id } = useParams();
  const [agency, setAgency] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch agency
        const { data: companies, error: agencyError } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', slug);

        if (agencyError) throw agencyError;
        if (!companies || companies.length === 0) throw new Error('Agencia no encontrada');
        
        const currentAgency = companies[0];
        setAgency(currentAgency);

        // 2. Fetch vehicle
        const { data: vData, error: vError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', id)
          .eq('company_id', currentAgency.id)
          .single();

        if (vError) throw vError;
        setVehicle(vData);

      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar vehículo');
      } finally {
        setLoading(false);
      }
    }

    if (slug && id) loadData();
  }, [slug, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !vehicle || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Link to={`/booking/${slug}`} className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Volver al inicio
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Vehículo no encontrado'}</p>
        </div>
      </div>
    );
  }

  const config = agency.storefront_config || {};
  const themeColor = config.themeColor || '#10b981';

  // Format WhatsApp message
  const whatsappNumber = config.whatsapp ? config.whatsapp.replace(/\+/g, '') : '';
  const waMessage = encodeURIComponent(
    `Hola, estoy interesado en alquilar el vehículo *${vehicle.brand} ${vehicle.model}* que vi en su página web.\n\nPor favor, indíquenme disponibilidad y pasos a seguir.`
  );
  const waUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${waMessage}` : '#';

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header Público */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link to={`/booking/${slug}`} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: themeColor }}>
            {agency.name}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Imagen del vehículo */}
            <div className="h-64 lg:h-auto bg-gray-100 flex items-center justify-center p-8">
              {vehicle.image_url ? (
                <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} className="max-w-full max-h-full object-contain drop-shadow-xl" />
              ) : (
                <Car className="w-32 h-32 text-gray-300" />
              )}
            </div>

            {/* Detalles */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Disponible
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model}
              </h2>
              <div className="text-3xl font-bold mb-8" style={{ color: themeColor }}>
                {vehicle.daily_rate} MAD <span className="text-lg text-gray-500 font-normal">/ día</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Año</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Settings className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Transmisión</p>
                    <p className="font-medium">{vehicle.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Fuel className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Combustible</p>
                    <p className="font-medium">{vehicle.fuel}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Plazas</p>
                    <p className="font-medium">{vehicle.seats} Personas</p>
                  </div>
                </div>
              </div>

              {vehicle.notes && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">{vehicle.notes}</p>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-gray-100">
                {whatsappNumber ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-8 py-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#25D366' }} // WhatsApp Green
                  >
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Consultar por WhatsApp
                  </a>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex">
                    La agencia no ha configurado un número de contacto.
                  </div>
                )}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Sin compromiso. Contacta directamente con la agencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

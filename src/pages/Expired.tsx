import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Expired = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Suscripción Expirada</h1>
        <p className="text-slate-600 mb-8">
          El periodo de prueba de tu agencia ha finalizado o tu suscripción ha sido suspendida. 
          Por favor, contacta con el soporte de VEKTORLAPS para reactivar tu cuenta y recuperar el acceso a tus datos.
        </p>

        <div className="flex flex-col gap-3">
          <a href="mailto:soporte@vektorlaps.com" className="btn btn-primary w-full">
            Contactar Soporte
          </a>
          <button onClick={handleLogout} className="btn btn-outline w-full flex justify-center items-center gap-2">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expired;

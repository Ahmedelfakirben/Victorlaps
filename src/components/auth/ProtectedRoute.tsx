import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ requireSuperAdmin = false }: { requireSuperAdmin?: boolean }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfileAndFinish = async (currentSession: any) => {
      if (currentSession) {
        const { data: prof } = await supabase.from('profiles').select('*, companies(*)').eq('id', currentSession.user.id).single();
        if (mounted) {
          setProfile(prof);
          setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        fetchProfileAndFinish(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        fetchProfileAndFinish(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && profile?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check trial expiration
  if (profile?.role !== 'superadmin' && profile?.companies?.status === 'trial') {
    const trialEnd = new Date(profile.companies.trial_ends_at);
    if (new Date() > trialEnd) {
      // Mark as expired in DB (optional, but we can just redirect)
      return <Navigate to="/expired" replace />;
    }
  }

  if (profile?.role !== 'superadmin' && profile?.companies?.status === 'expired') {
    return <Navigate to="/expired" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

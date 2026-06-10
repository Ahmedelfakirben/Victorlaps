import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Loader2, ShieldCheck, PlayCircle, StopCircle, 
  RefreshCw, Building2, Activity, Clock, AlertTriangle, 
  MoreVertical, CheckCircle2, UserCheck, HardDrive, DollarSign, Megaphone, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SuperAdmin.css';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, expired: 0, mrr: 0, storage: 0 });
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [replyMsg, setReplyMsg] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [compRes, msgRes] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    ]);
    
    if (!compRes.error && compRes.data) {
      setCompanies(compRes.data);
      setStats({
        total: compRes.data.length,
        active: compRes.data.filter((c: any) => c.status === 'active').length,
        trial: compRes.data.filter((c: any) => c.status === 'trial').length,
        expired: compRes.data.filter((c: any) => c.status === 'expired' || c.status === 'suspended').length,
        mrr: compRes.data.reduce((sum: number, c: any) => sum + Number(c.mrr || 0), 0),
        storage: compRes.data.reduce((sum: number, c: any) => sum + Number(c.storage_used_mb || 0), 0)
      });
    }
    if (!msgRes.error && msgRes.data) {
      setMessages(msgRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('companies').update({ status: newStatus }).eq('id', id);
    if (!error) fetchData();
  };

  const handleImpersonate = (companyId: string, companyName: string) => {
    if (confirm(`Deseas entrar en la cuenta de ${companyName}?`)) {
      localStorage.setItem('impersonated_company_id', companyId);
      window.location.href = '/dashboard';
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg) return;
    await supabase.from('system_broadcasts').insert([{ message: broadcastMsg, type: 'info', active: true }]);
    setBroadcastMsg('');
    alert('Mensaje global publicado con éxito.');
  };

  const handleViewCompany = async (company: any) => {
    setSelectedCompany(company);
    setLoadingUsers(true);
    
    // Fetch users belonging to this company using profiles table
    // Auth users email can't be fetched easily unless we have an admin RPC or we joined profiles with auth.users if we stored it
    // Wait, profiles doesn't have email. But wait! auth.users is protected. Does Superadmin have access?
    // Let's call an RPC or just fetch profiles. 
    const { data: profs } = await supabase.from('profiles').select('id, role, created_at').eq('company_id', company.id);
    
    setCompanyUsers(profs || []);
    setLoadingUsers(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('impersonated_company_id');
    navigate('/login');
  };

  const handleSendReply = async () => {
    if (!replyMsg || !replyText) return;
    setSendingReply(true);
    try {
      // Insert into mail_queue
      await supabase.from('mail_queue').insert([{
        to_email: replyMsg.email,
        subject: `RE: Support Vektorlaps OS`,
        body_html: `<p>Bonjour ${replyMsg.name},</p><p>${replyText.replace(/\n/g, '<br/>')}</p><hr/><p>Support Vektorlaps OS</p>`
      }]);
      // Mark message as replied
      await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', replyMsg.id);
      
      alert('Réponse envoyée !');
      setReplyMsg(null);
      setReplyText('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12 mt-20"><Loader2 className="animate-spin text-gold" size={48} /></div>;

  return (
    <div className="super-admin-page animate-float-in">
      <div className="sa-header">
        <div className="sa-title-group">
          <h1>
            <ShieldCheck size={40} />
            VEKTORLAPS OS
          </h1>
          <p className="sa-subtitle">SaaS Management Command Center</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchData} className="btn btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
            <RefreshCw size={18} /> Refresh Data
          </button>
          <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
            <LogOut size={18} /> Desconectar
          </button>
        </div>
      </div>

      <div className="sa-kpi-grid">
        <div className="sa-kpi-card" style={{ animationDelay: '0.1s' }}>
          <div className="kpi-icon-wrap"><Building2 size={28} /></div>
          <div className="kpi-info">
            <h3>Total Agencies</h3>
            <p className="kpi-value">{stats.total}</p>
          </div>
        </div>
        <div className="sa-kpi-card" style={{ animationDelay: '0.2s' }}>
          <div className="kpi-icon-wrap" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
            <Activity size={28} />
          </div>
          <div className="kpi-info">
            <h3>Active Subscriptions</h3>
            <p className="kpi-value">{stats.active}</p>
          </div>
        </div>
        <div className="sa-kpi-card" style={{ animationDelay: '0.3s' }}>
          <div className="kpi-icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={28} />
          </div>
          <div className="kpi-info">
            <h3>In Trial</h3>
            <p className="kpi-value">{stats.trial}</p>
          </div>
        </div>
        <div className="sa-kpi-card" style={{ animationDelay: '0.4s' }}>
          <div className="kpi-icon-wrap" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
            <DollarSign size={28} />
          </div>
          <div className="kpi-info">
            <h3>Total MRR</h3>
            <p className="kpi-value">{stats.mrr.toLocaleString()} MAD</p>
          </div>
        </div>
        <div className="sa-kpi-card" style={{ animationDelay: '0.5s' }}>
          <div className="kpi-icon-wrap" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>
            <HardDrive size={28} />
          </div>
          <div className="kpi-info">
            <h3>Storage Used</h3>
            <p className="kpi-value">{stats.storage.toLocaleString()} MB</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 animate-float-in" style={{ animationDelay: '0.6s' }}>
        <h3 className="flex items-center gap-2 mb-4 text-primary font-bold"><Megaphone size={20}/> Sistema de Anuncios Globales</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="input-field flex-1" 
            placeholder="Escribe un anuncio que verán TODAS las agencias al iniciar sesión..."
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleBroadcast}>
            Publicar Broadcast
          </button>
        </div>
      </div>

      <div className="sa-table-container animate-float-in" style={{ animationDelay: '0.7s' }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Tenant / Agency</th>
              <th>Contact Info</th>
              <th>Plan & MRR</th>
              <th>Last Login</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => handleViewCompany(c)}>
                <td>
                  <div className="sa-agency-info">
                    <div className="sa-avatar">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="sa-agency-details">
                      <h4>{c.name}</h4>
                      <p>ID: {c.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="sa-agency-details">
                    <h4>{c.email || 'No email provided'}</h4>
                    <p>{c.phone || 'No phone'}</p>
                  </div>
                </td>
                <td>
                  <div className="sa-agency-details">
                    <h4><span className="badge badge-primary">{c.subscription_plan?.toUpperCase()}</span></h4>
                    <p className="mt-1 font-semibold">{c.mrr || 0} MAD/mo</p>
                  </div>
                </td>
                <td>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {c.last_login_at ? new Date(c.last_login_at).toLocaleString() : 'Never logged in'}
                  </span>
                </td>
                <td>
                  <span className={`sa-badge ${c.status}`}>
                    {c.status === 'active' && <CheckCircle2 size={14} />}
                    {c.status === 'trial' && <Clock size={14} />}
                    {c.status === 'expired' && <AlertTriangle size={14} />}
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="sa-actions" style={{ justifyContent: 'flex-end' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleImpersonate(c.id, c.name); }} className="sa-btn-action" title="Impersonate (Login as Agency)" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                      <UserCheck size={18} />
                    </button>
                    {c.status !== 'active' ? (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'active'); }} className="sa-btn-action success" title="Activate Subscription">
                        <PlayCircle size={18} />
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'suspended'); }} className="sa-btn-action danger" title="Suspend Subscription">
                        <StopCircle size={18} />
                      </button>
                    )}
                    <button className="sa-btn-action" title="More Options">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                  No agencies registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sa-section mt-12">
        <h2 className="sa-section-title"><Megaphone size={24} className="text-gold" /> Boîte de Réception (Contact)</h2>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Message</th>
              <th>Statut</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td className="text-secondary whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="font-bold">{m.name}</div>
                  <div className="text-sm text-secondary">{m.email} {m.phone ? `(${m.phone})` : ''}</div>
                </td>
                <td style={{ maxWidth: '400px', whiteSpace: 'normal' }}>
                  <div className="text-sm bg-surface-2 p-3 rounded border border-border">{m.message}</div>
                </td>
                <td>
                  {m.status === 'new' ? (
                    <span className="badge badge-warning">Nouveau</span>
                  ) : (
                    <span className="badge badge-success">Répondu</span>
                  )}
                </td>
                <td className="text-right">
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    setReplyMsg(m);
                    setReplyText(`Merci pour votre message.\n\n`);
                  }}>
                    Répondre
                  </button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr><td colSpan={5} className="text-center p-8 text-secondary">Aucun message de contact.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {replyMsg && (
        <div className="modal-overlay" onClick={() => setReplyMsg(null)}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Répondre à {replyMsg.name}</h2>
              <button className="btn btn-ghost" onClick={() => setReplyMsg(null)}>X</button>
            </div>
            <div className="modal-body mt-4">
              <div className="mb-4 p-4 bg-surface-2 rounded border border-border">
                <p className="text-sm text-secondary mb-2">Message original :</p>
                <p className="text-sm italic">"{replyMsg.message}"</p>
              </div>
              <div className="form-group">
                <label className="input-label">Votre Réponse (Sera envoyée par email à {replyMsg.email})</label>
                <textarea 
                  className="input-field" 
                  rows={6} 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button className="btn btn-outline" onClick={() => setReplyMsg(null)}>Annuler</button>
              <button className="btn btn-primary-glow" onClick={handleSendReply} disabled={sendingReply}>
                {sendingReply ? 'Envoi...' : 'Envoyer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCompany && (
        <div className="modal-overlay" onClick={() => setSelectedCompany(null)}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Información del Tenant: {selectedCompany.name}</h2>
              <button className="btn btn-ghost" onClick={() => setSelectedCompany(null)}>X</button>
            </div>
            <div className="modal-body mt-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <p className="text-xs text-secondary uppercase font-bold">Tenant UID</p>
                  <p className="font-medium mt-1" style={{ wordBreak: 'break-all' }}>{selectedCompany.id}</p>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <p className="text-xs text-secondary uppercase font-bold">Fecha de Creación</p>
                  <p className="font-medium mt-1">{new Date(selectedCompany.created_at).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <p className="text-xs text-secondary uppercase font-bold">Correo de Contacto</p>
                  <p className="font-medium mt-1">{selectedCompany.email || 'No proporcionado'}</p>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <p className="text-xs text-secondary uppercase font-bold">Teléfono</p>
                  <p className="font-medium mt-1">{selectedCompany.phone || 'No proporcionado'}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3 border-b border-border pb-2">Usuarios ({companyUsers.length})</h3>
              {loadingUsers ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)' }}>
                      <tr>
                        <th>User UID</th>
                        <th>Rol</th>
                        <th>Fecha de Unión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.id}</td>
                          <td><span className="badge badge-secondary">{u.role}</span></td>
                          <td className="text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {companyUsers.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-secondary p-4">Ningún usuario encontrado</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-outline" onClick={() => setSelectedCompany(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;

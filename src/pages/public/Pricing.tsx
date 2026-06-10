import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Tarifs transparents</h1>
      <p style={{ marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center' }}>Choisissez le plan adapté à la taille de votre flotte.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Standard Plan */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Standard</h3>
          <p style={{ marginBottom: '2rem', color: '#888' }}>Pour les agences qui démarrent.</p>
          <div style={{ fontSize: '3rem', color: '#ffffff', fontWeight: 'bold', marginBottom: '2rem' }}>490<span style={{ fontSize: '1rem', color: '#888', fontWeight: 'normal' }}> MAD / mois</span></div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Jusqu'à 20 véhicules</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Contrats et factures illimités</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> 2 Utilisateurs inclus</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Support par email</li>
          </ul>
          
          <button className="btn-secondary-glass" style={{ width: '100%', padding: '1rem' }}>Démarrer l'essai gratuit</button>
        </div>

        {/* Pro Plan */}
        <div style={{ background: 'linear-gradient(180deg, rgba(123,224,153,0.1) 0%, rgba(255,255,255,0.02) 100%)', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #7BE099', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#7BE099', color: '#000', padding: '0.2rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Le plus populaire</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pro</h3>
          <p style={{ marginBottom: '2rem', color: '#888' }}>Pour les flottes en croissance.</p>
          <div style={{ fontSize: '3rem', color: '#ffffff', fontWeight: 'bold', marginBottom: '2rem' }}>890<span style={{ fontSize: '1rem', color: '#888', fontWeight: 'normal' }}> MAD / mois</span></div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Jusqu'à 100 véhicules</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Gestion Multi-Agences</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> 5 Utilisateurs inclus</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle2 size={20} color="#7BE099" /> Support prioritaire WhatsApp</li>
          </ul>
          
          <button className="btn-primary-glow" style={{ width: '100%', padding: '1rem' }}>Démarrer l'essai gratuit</button>
        </div>

      </div>
    </div>
  );
};

export default Pricing;

import React from 'react';
import { Car, Zap, ShieldCheck, Database, BarChart3, Globe } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Toutes les fonctionnalités</h1>
      <p style={{ marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center' }}>Vektorlaps OS a été pensé pour répondre à tous les besoins des agences modernes.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <Car size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Gestion de Flotte</h3>
          <p>Suivez chaque véhicule en temps réel. Historique des réparations, alertes de vidange, gestion du kilométrage et disponibilité instantanée.</p>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <Zap size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Contrats Rapides</h3>
          <p>Générez un contrat en moins de 60 secondes. Signature électronique, calcul automatisé des tarifs et de la TVA, envoi par email.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <Database size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>CRM Intégré</h3>
          <p>Base de données de clients centralisée. Fiches clients avec documents (permis, passeport) stockés de manière sécurisée.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <BarChart3 size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Rapports & Analyses</h3>
          <p>Visualisez vos performances : taux d'occupation, revenus par véhicule, prévisions financières et bilans mensuels exportables.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <ShieldCheck size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Contrôle d'Accès</h3>
          <p>Gérez les rôles de vos employés (Admin, Gérant, Agent). Définissez qui peut voir quelles informations dans chaque agence.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(123,224,153,0.1)' }}>
          <Globe size={40} color="#7BE099" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Multi-Agences</h3>
          <p>Supervisez plusieurs points de vente depuis un seul compte. Transférez des véhicules entre vos parcs en quelques clics.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;

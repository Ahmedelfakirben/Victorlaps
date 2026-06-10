import React from 'react';

const Blog: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Le Blog Vektorlaps</h1>
      <p style={{ marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center' }}>Astuces, conseils et stratégies pour développer votre agence de location.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '200px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#7BE099' }}>[Image Placeholder]</span>
          </div>
          <div style={{ padding: '2rem' }}>
            <p style={{ color: '#7BE099', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Gestion</p>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem' }}>Comment optimiser le taux d'occupation de votre flotte ?</h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Découvrez nos 5 stratégies prouvées pour maximiser la rentabilité de vos véhicules en basse saison.</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '200px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#7BE099' }}>[Image Placeholder]</span>
          </div>
          <div style={{ padding: '2rem' }}>
            <p style={{ color: '#7BE099', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Légal</p>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem' }}>Les nouvelles réglementations sur la location longue durée</h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Tout ce que vous devez savoir sur les changements législatifs de 2026 concernant les contrats LLD.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blog;

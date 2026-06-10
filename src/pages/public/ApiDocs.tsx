import React from 'react';

const ApiDocs: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem' }}>API Documentation</h1>
      <p style={{ marginBottom: '3rem', fontSize: '1.2rem' }}>Intégrez Vektorlaps OS directement dans vos propres applications ou sites vitrines.</p>
      
      <div style={{ background: '#111827', border: '1px solid rgba(123,224,153,0.2)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#7BE099', marginBottom: '1rem', fontSize: '1.5rem' }}>Authentification</h2>
        <p style={{ marginBottom: '1rem' }}>Toutes les requêtes à l'API nécessitent un token Bearer. Vous pouvez générer ce token depuis les Paramètres de votre compte (Formule Pro uniquement).</p>
        <pre style={{ background: '#0B0E14', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#e5e7eb' }}>
          <code>
            Authorization: Bearer vk_live_xxxxxxxxxxxxx
          </code>
        </pre>
      </div>

      <div style={{ background: '#111827', border: '1px solid rgba(123,224,153,0.2)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#7BE099', marginBottom: '1rem', fontSize: '1.5rem' }}>Lister les véhicules disponibles</h2>
        <p style={{ marginBottom: '1rem' }}>Utile pour afficher votre flotte sur votre site web public.</p>
        <div style={{ background: '#0B0E14', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <span style={{ color: '#7BE099', fontWeight: 'bold', marginRight: '1rem' }}>GET</span>
          <span style={{ color: '#e5e7eb' }}>https://api.vektorlaps.com/v1/vehicles?status=available</span>
        </div>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '4rem' }}>
        La documentation complète interactive (Swagger) sera bientôt disponible.
      </p>
    </div>
  );
};

export default ApiDocs;

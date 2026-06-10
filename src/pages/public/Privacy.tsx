import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '2rem' }}>Politique de confidentialité</h1>
      <p style={{ marginBottom: '1.5rem' }}>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>1. Collecte des données</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Nous collectons les informations que vous nous fournissez directement (nom de l'agence, emails, etc.) et les données générées par votre utilisation de la plateforme (véhicules, contrats, clients).
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>2. Utilisation des données</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Vos données sont utilisées exclusivement pour fournir, maintenir et améliorer nos services. Nous ne vendons en aucun cas vos informations ou celles de vos clients à des tiers.
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>3. Sécurité</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Toutes les données sont chiffrées en transit (SSL/TLS) et au repos. Nos serveurs utilisent des protocoles de sécurité stricts pour garantir l'intégrité de vos informations commerciales.
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>4. Vos droits</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Vous pouvez à tout moment exporter vos données, demander leur modification ou leur suppression complète de nos systèmes en contactant notre support technique.
      </p>
    </div>
  );
};

export default Privacy;

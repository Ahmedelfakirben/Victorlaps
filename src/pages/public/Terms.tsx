import React from 'react';

const Terms: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '2rem' }}>Conditions d'utilisation</h1>
      <p style={{ marginBottom: '1.5rem' }}>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>1. Acceptation des conditions</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        En accédant et en utilisant Vektorlaps OS, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>2. Description du service</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Vektorlaps OS est une plateforme SaaS destinée à la gestion des agences de location de voitures, incluant la gestion de flotte, la création de contrats et la facturation.
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>3. Compte utilisateur</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte. Vous devez nous notifier immédiatement de toute utilisation non autorisée.
      </p>
      
      <h2 style={{ color: '#ffffff', marginTop: '2rem', marginBottom: '1rem' }}>4. Résiliation</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions ou d'utilisation abusive de la plateforme.
      </p>
    </div>
  );
};

export default Terms;

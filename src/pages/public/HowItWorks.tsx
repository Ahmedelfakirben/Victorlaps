import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Comment ça marche ?</h1>
      <p style={{ marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center' }}>Digitalisez votre agence de location en seulement 3 étapes simples.</p>
      
      <div style={{ position: 'relative', paddingLeft: '3rem', borderLeft: '3px solid rgba(123,224,153,0.2)' }}>
        
        <div style={{ marginBottom: '4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-58px', top: '0', background: '#0B0E14', border: '3px solid #7BE099', color: '#7BE099', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>1</div>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Créez votre compte et configurez l'agence</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Inscrivez-vous en moins d'une minute. Vous accédez immédiatement à votre tableau de bord. Personnalisez vos paramètres : nom de l'agence, logo, taux de TVA, et devise.</p>
        </div>

        <div style={{ marginBottom: '4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-58px', top: '0', background: '#0B0E14', border: '3px solid #7BE099', color: '#7BE099', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>2</div>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Ajoutez vos véhicules et clients</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Importez votre flotte. Renseignez les immatriculations, les kilométrages initiaux et les tarifs journaliers. Vous pouvez également importer votre base de clients existante.</p>
        </div>

        <div style={{ marginBottom: '4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-58px', top: '0', background: '#0B0E14', border: '3px solid #7BE099', color: '#7BE099', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>3</div>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Générez votre premier contrat</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Sélectionnez un client, un véhicule disponible et des dates. Vektorlaps OS calcule le prix, vérifie les conflits de planning, et génère un contrat PDF professionnel prêt à être imprimé ou signé numériquement.</p>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;

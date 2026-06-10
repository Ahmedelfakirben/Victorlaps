import React from 'react';

const Updates: React.FC = () => {
  const updates = [
    {
      version: "v2.1.0",
      date: "Octobre 2026",
      title: "Facturation automatisée et Rapports avancés",
      changes: [
        "Nouveau système de génération de factures en un clic depuis un contrat.",
        "Ajout de graphiques de performance dans le tableau de bord (Chiffre d'affaires, Taux d'occupation).",
        "Amélioration de la vitesse de recherche des clients."
      ]
    },
    {
      version: "v2.0.0",
      date: "Juin 2026",
      title: "Lancement de Vektorlaps OS 2.0",
      changes: [
        "Refonte complète de l'interface utilisateur avec mode sombre natif.",
        "Support multi-agences pour les grandes flottes.",
        "Génération des contrats au format PDF standardisé.",
        "Nouveau système d'authentification sécurisé."
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '1rem' }}>Mises à jour</h1>
      <p style={{ marginBottom: '3rem', fontSize: '1.2rem' }}>Découvrez les dernières nouveautés et améliorations de Vektorlaps OS.</p>
      
      <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid rgba(123,224,153,0.3)' }}>
        {updates.map((update, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: '3rem' }}>
            <div style={{ 
              position: 'absolute', left: '-33px', top: '5px', width: '16px', height: '16px', 
              background: '#7BE099', borderRadius: '50%', boxShadow: '0 0 10px rgba(123,224,153,0.5)' 
            }}></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ color: '#ffffff', margin: 0 }}>{update.title}</h2>
              <span style={{ background: 'rgba(123,224,153,0.1)', color: '#7BE099', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{update.version}</span>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>{update.date}</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              {update.changes.map((change, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;

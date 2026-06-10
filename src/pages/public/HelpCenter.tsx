import React from 'react';

const HelpCenter: React.FC = () => {
  const faqs = [
    {
      q: "Comment ajouter un nouveau véhicule ?",
      a: "Allez dans la section 'Flotte' de votre tableau de bord, cliquez sur 'Nouveau véhicule' et remplissez les informations (immatriculation, marque, kilométrage)."
    },
    {
      q: "Puis-je gérer plusieurs agences avec un seul compte ?",
      a: "Oui, la formule Pro vous permet de créer des parcs distincts pour chaque agence et d'assigner des employés spécifiques à chaque parc."
    },
    {
      q: "Comment est calculée la TVA sur les contrats ?",
      a: "La TVA est calculée automatiquement selon le taux que vous avez défini dans les Paramètres de facturation (généralement 20%)."
    },
    {
      q: "Que se passe-t-il après l'essai gratuit de 48h ?",
      a: "Votre compte sera suspendu jusqu'à ce que vous choisissiez un abonnement. Aucune de vos données ne sera perdue pendant 30 jours."
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '1rem' }}>Centre d'aide</h1>
      <p style={{ marginBottom: '3rem', fontSize: '1.2rem' }}>Retrouvez ici les réponses aux questions les plus fréquentes.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#7BE099', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(123,224,153,0.1), rgba(65,120,135,0.2))', borderRadius: '12px', textAlign: 'center' }}>
        <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Vous ne trouvez pas votre réponse ?</h3>
        <p style={{ marginBottom: '1.5rem' }}>Notre équipe de support est là pour vous aider.</p>
        <a href="mailto:support@vektorlaps.com" className="btn-primary-glow" style={{ display: 'inline-block', textDecoration: 'none' }}>Contacter le support</a>
      </div>
    </div>
  );
};

export default HelpCenter;

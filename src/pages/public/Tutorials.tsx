import React from 'react';
import { Play } from 'lucide-react';

const Tutorials: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#c0c0c0', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Tutoriels Vidéos</h1>
      <p style={{ marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center' }}>Apprenez à maîtriser Vektorlaps OS en quelques minutes.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '250px', background: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(123,224,153,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play fill="#7BE099" color="#7BE099" />
            </div>
          </div>
          <div style={{ padding: '1rem 0.5rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>1. Premier pas : Configurer son agence</h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Durée : 3 min</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '250px', background: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(123,224,153,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play fill="#7BE099" color="#7BE099" />
            </div>
          </div>
          <div style={{ padding: '1rem 0.5rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>2. Comment créer un contrat rapidement</h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Durée : 5 min</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;

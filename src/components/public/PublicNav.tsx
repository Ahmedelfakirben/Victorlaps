import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface PublicNavProps {
  alwaysSolid?: boolean;
}

const PublicNav: React.FC<PublicNavProps> = ({ alwaysSolid = false }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(alwaysSolid);

  useEffect(() => {
    // Dynamic favicon for public pages
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = '/logo-green.svg';
    }

    if (alwaysSolid) {
      setIsScrolled(true);
    } else {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        // Revert favicon when leaving public area
        if (link) {
          link.href = '/logo.svg';
        }
      };
    }
    
    return () => {
      // Revert favicon when leaving public area (if always solid)
      if (link) {
        link.href = '/logo.svg';
      }
    };
  }, [alwaysSolid]);

  return (
    <nav className={`landing-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo-green.svg" alt="VEKTORLAPS" className="landing-logo" />
          <span className="landing-brand" style={{ color: '#ffffff' }}>VEKTORLAPS</span>
        </Link>
        <div className="nav-links">
          <Link to="/features">Fonctionnalités</Link>
          <Link to="/how-it-works">Comment ça marche</Link>
          <Link to="/pricing">Tarifs</Link>
          <button className="btn-login-outline" onClick={() => navigate('/login')}>Se Connecter</button>
          <button className="btn-primary-glow" onClick={() => navigate('/register')}>Démarrer l'essai gratuit</button>
        </div>
      </div>
    </nav>
  );
};

export default PublicNav;

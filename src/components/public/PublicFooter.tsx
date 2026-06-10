import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Video, Mail, PhoneCall } from 'lucide-react';

const PublicFooter: React.FC = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-newsletter">
          <h3 style={{ color: '#ffffff' }}>Abonnez-vous à notre newsletter</h3>
          <p>Recevez les dernières mises à jour, des astuces de gestion et nos offres exclusives directement dans votre boîte mail.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Votre adresse email" />
            <button className="btn-primary-glow">S'abonner</button>
          </div>
        </div>
      </div>
      <div className="footer-content">
        <div className="footer-brand-col">
          <img src="/logo-green.svg" alt="VEKTORLAPS" className="footer-logo" />
          <p className="footer-desc">
            Vektorlaps OS est le système SaaS de référence pour la location de voitures. Puissant, sécurisé et conçu pour l'efficacité.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Globe"><Globe size={20} /></a>
            <a href="#" aria-label="Message"><MessageCircle size={20} /></a>
            <a href="#" aria-label="Video"><Video size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-link-group">
            <h4>Produit</h4>
            <Link to="/features">Fonctionnalités</Link>
            <Link to="/how-it-works">Comment ça marche</Link>
            <Link to="/pricing">Tarifs</Link>
            <Link to="/updates">Mises à jour</Link>
          </div>
          <div className="footer-link-group">
            <h4>Ressources</h4>
            <Link to="/help">Centre d'aide</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/tutorials">Tutoriels vidéos</Link>
            <Link to="/api">API Documentation</Link>
          </div>
          <div className="footer-link-group">
            <h4>Légal & Contact</h4>
            <Link to="/terms">Conditions d'utilisation</Link>
            <Link to="/privacy">Politique de confidentialité</Link>
            <a href="mailto:contact@vektorlaps.com"><Mail size={14} className="inline mr-1" /> contact@vektorlaps.com</a>
            <a href="tel:+212600000000"><PhoneCall size={14} className="inline mr-1" /> +212 600 000 000</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', marginTop: '2rem' }}>
          <p style={{ color: '#888', margin: 0 }}>© {new Date().getFullYear()} VEKTORLAPS OS. Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
            <Link to="/terms" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Conditions</Link>
            <Link to="/privacy" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Confidentialité</Link>
            <Link to="/help" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

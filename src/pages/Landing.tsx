import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Car, ShieldCheck, Zap, CheckCircle2, Send } from 'lucide-react';
import PublicNav from '../components/public/PublicNav';
import PublicFooter from '../components/public/PublicFooter';
import { supabase } from '../lib/supabase';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'superadmin') {
          navigate('/superadmin');
        } else {
          navigate('/dashboard');
        }
      }
    });
  }, [navigate]);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const { error } = await supabase.from('contact_messages').insert([contactForm]);
      if (error) throw error;
      setContactStatus('success');
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setContactStatus(''), 5000);
    } catch (err) {
      console.error(err);
      setContactStatus('error');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.querySelectorAll('.feature-card, .step-item, .pricing-card');
    cards.forEach(card => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  };

  return (
    <div className="landing-page" onMouseMove={handleMouseMove}>
      {/* Global animated orbs */}
      <div className="global-glow-1"></div>
      <div className="global-glow-2"></div>
      
      {/* Section Spotlights */}
      <div className="section-glow glow-features"></div>
      <div className="section-glow glow-steps"></div>
      <div className="section-glow glow-pricing"></div>
      {/* Navigation */}
      <PublicNav alwaysSolid={false} />

      {/* Hero Section */}
      <section className="hero-section">
        <video className="hero-bg-video" autoPlay loop muted playsInline>
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-bg-overlay"></div>
        <div className="hero-bg-glow"></div>
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Le Système d'Exploitation pour votre <br/>
            <span className="text-gradient">Agence de Location</span>
          </h1>
          <p className="hero-subtitle">
            Gérez votre flotte, vos contrats et vos finances depuis une plateforme unifiée. Multi-agences, temps réel et conçu pour la performance.
          </p>
          <div className="hero-actions animate-fade-in delay-2">
            <button className="btn-primary-glow" onClick={() => navigate('/register')}>
              Commencer maintenant <ArrowRight size={20} />
            </button>
            <button className="btn-secondary-glass">Voir la démo</button>
          </div>
          <div className="hero-metrics">
            <div className="metric">
              <span className="metric-val">100%</span>
              <span className="metric-label">Cloud & Sécurisé</span>
            </div>
            <div className="metric">
              <span className="metric-val">Multi</span>
              <span className="metric-label">Agences & Parcs</span>
            </div>
            <div className="metric">
              <span className="metric-val">24/7</span>
              <span className="metric-label">Support Technique</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une suite complète d'outils pour automatiser la gestion de vos véhicules.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Car size={32} /></div>
            <h3>Gestion de Flotte</h3>
            <p>Suivez l'état, le kilométrage et l'entretien de chaque véhicule en temps réel.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={32} /></div>
            <h3>Contrats Rapides</h3>
            <p>Générez et imprimez des contrats professionnels en moins de 2 minutes avec calcul automatique de TVA.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={32} /></div>
            <h3>Sécurité Avancée</h3>
            <p>Accès multi-niveaux, base de données chiffrée et hébergement cloud haute disponibilité.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>Démarrez en 3 étapes simples</h2>
          <p>Il n'a jamais été aussi facile de digitaliser votre agence.</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Créez votre compte</h3>
              <p>Inscrivez-vous en moins d'une minute, aucune carte bancaire n'est requise. Vous obtenez un environnement dédié et sécurisé pour votre agence.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Ajoutez vos véhicules</h3>
              <p>Importez votre flotte (véhicules, kilométrage, tarifs) et configurez les règles de tarification de votre agence selon la saison.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Commencez à louer</h3>
              <p>Générez votre premier contrat ! Le système calculera automatiquement les montants, mettra à jour la disponibilité et créera la facture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2>Des tarifs simples et transparents</h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Standard</h3>
              <div className="price"><span>490</span> MAD<span>/mois</span></div>
              <p>Idéal pour les petites agences</p>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} className="icon-success" /> Jusqu'à 20 véhicules</li>
              <li><CheckCircle2 size={18} className="icon-success" /> Contrats illimités</li>
              <li><CheckCircle2 size={18} className="icon-success" /> 2 Utilisateurs</li>
              <li><CheckCircle2 size={18} className="icon-success" /> Support email</li>
            </ul>
            <button className="btn-secondary-glass btn-block" onClick={() => navigate('/register')}>Démarrer l'essai</button>
          </div>
          
          <div className="pricing-card popular">
            <div className="popular-badge">Le plus populaire</div>
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price"><span>890</span> MAD<span>/mois</span></div>
              <p>Pour les agences en pleine croissance</p>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} className="icon-success" /> Jusqu'à 100 véhicules</li>
              <li><CheckCircle2 size={18} className="icon-success" /> Contrats & Facturation</li>
              <li><CheckCircle2 size={18} className="icon-success" /> 5 Utilisateurs</li>
              <li><CheckCircle2 size={18} className="icon-success" /> Support prioritaire WhatsApp</li>
            </ul>
            <button className="btn-primary-glow btn-block" onClick={() => navigate('/register')}>Démarrer l'essai</button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-header">
          <h2>Contactez-nous</h2>
          <p>Vous avez des questions ? Notre équipe est là pour vous aider.</p>
        </div>
        <div className="contact-container">
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Nom complet *</label>
              <input type="text" required className="input-field" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder="Votre nom" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" required className="input-field" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder="votre@email.com" />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" className="input-field" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder="+212..." />
              </div>
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea required className="input-field" rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="Comment pouvons-nous vous aider ?"></textarea>
            </div>
            <button type="submit" className="btn-primary-glow" disabled={contactStatus === 'sending'} style={{ width: '100%', marginTop: '1rem' }}>
              {contactStatus === 'sending' ? 'Envoi en cours...' : <><Send size={18} /> Envoyer le message</>}
            </button>
            {contactStatus === 'success' && <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded border border-green-500/20 text-center text-sm">Message envoyé avec succès ! Nous vous répondrons bientôt.</div>}
            {contactStatus === 'error' && <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded border border-red-500/20 text-center text-sm">Une erreur est survenue. Veuillez réessayer.</div>}
          </form>
        </div>
      </section>

      {/* Expanded Footer */}
      <PublicFooter />
    </div>
  );
};

export default Landing;

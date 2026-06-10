import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNav from './PublicNav';
import PublicFooter from './PublicFooter';
import '../../pages/Landing.css'; // Inherit landing styles

const PublicLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0E14' }}>
      <PublicNav alwaysSolid={true} />
      
      <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '60px' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          {/* Outlet for public subpages */}
          <Outlet />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicLayout;

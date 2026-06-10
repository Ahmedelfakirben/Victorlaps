import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'badge' | 'print';
  theme?: 'orange' | 'green';
}

const Logo201M: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'default', theme }) => {
  const [currentTheme, setCurrentTheme] = useState(theme || 'orange');

  useEffect(() => {
    // Si se pasa 'theme' explícitamente, lo usamos, si no escuchamos al documento.
    if (theme) {
      setCurrentTheme(theme);
      return;
    }

    const root = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-brand-theme') {
          setCurrentTheme(root.getAttribute('data-brand-theme') as any || 'orange');
        }
      });
    });
    
    setCurrentTheme(root.getAttribute('data-brand-theme') as any || 'orange');
    observer.observe(root, { attributes: true });

    return () => observer.disconnect();
  }, [theme]);
  const sizes = {
    xs: { height: '24px' },
    sm: { height: '32px' },
    md: { height: '48px' },
    lg: { height: '64px' },
    xl: { height: '96px' }
  };

  const curr = sizes[size];

  if (variant === 'badge' || variant === 'print') {
    return (
      <div className={`logo-badge ${className}`} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px',
        width: 'fit-content'
      }}>
        <img 
          src={currentTheme === 'green' ? "/logo-green.svg" : "/logo.svg"} 
          alt="VEKTORLAPS" 
          style={{ height: curr.height, width: 'auto', objectFit: 'contain' }} 
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
      <img 
        src={currentTheme === 'green' ? "/logo-green.svg" : "/logo.svg"} 
        alt="VEKTORLAPS" 
        style={{ height: curr.height, width: 'auto', objectFit: 'contain' }} 
      />
    </div>
  );
};

export default Logo201M;

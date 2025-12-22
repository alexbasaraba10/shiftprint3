import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

const AppleHeader = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/gallery', label: t('nav.gallery') },
    { path: '/shop', label: t('nav.shop') },
    { path: '/calculator', label: t('nav.calculator') },
    { path: '/contacts', label: t('nav.contacts') },
    { path: '/profile', label: language === 'ru' ? '👤 Профиль' : '👤 Profil', style: { background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 } }
  ];

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 max(env(safe-area-inset-left), 20px) 0 max(env(safe-area-inset-right), 20px)'
      }}>
        {/* Mobile: Burger Menu Left */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={24} color="var(--text-primary)" /> : <Menu size={24} color="var(--text-primary)" />}
        </button>

        {/* Logo Text Only */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ShiftPrint
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}
        className="desktop-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: isActive(item.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? 600 : 400,
                transition: 'color 0.2s ease',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => !isActive(item.path) && (e.target.style.color = 'var(--text-secondary)')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Globe size={18} />
          <span className="desktop-only">{language.toUpperCase()}</span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '48px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 999,
            padding: '20px',
            animation: 'slideDown 0.3s ease-out'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  letterSpacing: '-0.02em'
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .desktop-nav {
            display: none !important;
          }
          .desktop-only {
            display: none;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default AppleHeader;

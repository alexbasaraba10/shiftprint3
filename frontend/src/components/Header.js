import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="dark-header">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src="https://customer-assets.emergentagent.com/job_f1d7a600-9be3-4269-857f-414a16853032/artifacts/hlr2pxwp_%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F66_20250909160721.jpg"
          alt="ShiftPrint Logo"
          style={{ height: '45px', width: 'auto' }}
        />
      </Link>
      
      <nav className="dark-nav">
        <Link 
          to="/" 
          className={`dark-nav-link ${isActive('/') ? 'active' : ''}`}
        >
          {t('nav.home')}
        </Link>
        <Link 
          to="/gallery" 
          className={`dark-nav-link ${isActive('/gallery') ? 'active' : ''}`}
        >
          {t('nav.gallery')}
        </Link>
        <Link 
          to="/shop" 
          className={`dark-nav-link ${isActive('/shop') ? 'active' : ''}`}
        >
          {t('nav.shop')}
        </Link>
        <Link 
          to="/calculator" 
          className={`dark-nav-link ${isActive('/calculator') ? 'active' : ''}`}
        >
          {t('nav.calculator')}
        </Link>
        <Link 
          to="/contacts" 
          className={`dark-nav-link ${isActive('/contacts') ? 'active' : ''}`}
        >
          {t('nav.contacts')}
        </Link>
        <Link 
          to="/admin" 
          className={`dark-nav-link ${isActive('/admin') ? 'active' : ''}`}
        >
          {t('nav.admin')}
        </Link>
        
        <Button 
          onClick={toggleLanguage}
          className="btn-secondary"
          style={{ minHeight: '40px', padding: '8px 16px' }}
        >
          {language === 'ru' ? 'RO' : 'RU'}
        </Button>
      </nav>
    </header>
  );
};

export default Header;
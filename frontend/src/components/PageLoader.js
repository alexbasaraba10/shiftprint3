import React, { useState, useEffect } from 'react';
import PrinterLoader from './PrinterLoader';
import { useLanguage } from '../context/LanguageContext';

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if page already loaded
    if (document.readyState === 'complete') {
      setTimeout(() => setIsLoading(false), 500);
    } else {
      const handleLoad = () => {
        setTimeout(() => setIsLoading(false), 500);
      };
      window.addEventListener('load', handleLoad);
      
      // Fallback timeout
      const timeout = setTimeout(() => setIsLoading(false), 3000);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: isLoading ? 'none' : 'fadeOut 0.5s ease-out forwards'
    }}>
      <PrinterLoader 
        size="large" 
        text={language === 'ru' ? 'Загрузка...' : 'Se încarcă...'} 
      />
    </div>
  );
};

export default PageLoader;

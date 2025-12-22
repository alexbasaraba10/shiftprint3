import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Youtube, Mail, Phone, Heart } from 'lucide-react';

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 20px 30px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Company Info */}
        <div>
          <h3 style={{ 
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '16px',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ShiftPrint
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {language === 'ru' 
              ? 'Профессиональная 3D печать и реверс-инжиниринг в Молдове'
              : 'Printare 3D profesională și inginerie inversă în Moldova'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Быстрые ссылки' : 'Link-uri rapide'}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { path: '/calculator', label: language === 'ru' ? 'Расчёт стоимости' : 'Calcul cost' },
              { path: '/gallery', label: language === 'ru' ? 'Проекты' : 'Proiecte' },
              { path: '/shop', label: language === 'ru' ? 'Товары' : 'Produse' },
              { path: '/contacts', label: language === 'ru' ? 'Контакты' : 'Contacte' }
            ].map((link, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>
                <a href={link.path} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Мы в соцсетях' : 'Social media'}
          </h4>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <a 
              href="https://youtube.com/@shiftprintmoldova?si=UWETJB0PC1tCRc8H" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Youtube size={20} color="white" />
            </a>
            <a 
              href="https://ko-fi.com/shiftprint/goal?g=0" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FF5E5B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Support us on Ko-fi"
            >
              <Heart size={20} color="white" fill="white" />
            </a>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Phone size={16} />
              <span>+373 60 972 200</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} />
              <span>shiftprintmoldova@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        <p>© {new Date().getFullYear()} ShiftPrint. {language === 'ru' ? 'Все права защищены' : 'Toate drepturile rezervate'}.</p>
      </div>
    </footer>
  );
};

export default Footer;

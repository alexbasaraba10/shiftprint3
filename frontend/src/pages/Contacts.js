import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contacts = () => {
  const { t } = useLanguage();

  return (
    <div className="dark-container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="display-large" style={{ marginBottom: '60px', textAlign: 'center' }}>
          {t('contacts.title')}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}>
              <Mail size={28} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 className="heading-2" style={{ marginBottom: '8px' }}>
                {t('contacts.email')}
              </h3>
              <a 
                href="mailto:shiftprintmoldova@gmail.com" 
                className="body-large"
                style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
              >
                shiftprintmoldova@gmail.com
              </a>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}>
              <Phone size={28} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 className="heading-2" style={{ marginBottom: '8px' }}>
                {t('contacts.phone')}
              </h3>
              <a 
                href="tel:+373060972200" 
                className="body-large"
                style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
              >
                +373 060 972 200
              </a>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}>
              <MapPin size={28} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 className="heading-2" style={{ marginBottom: '8px' }}>
                {t('contacts.address')}
              </h3>
              <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
                Chișinău, Moldova
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
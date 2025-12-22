import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TextilePrint = () => {
  const { language } = useLanguage();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '60px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        padding: '100px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(48px, 8vw, 72px)',
            marginBottom: '24px',
            color: 'white',
            fontWeight: 700
          }}>
            Black Textile Print
          </h1>
          <p style={{ 
            fontSize: 'clamp(18px, 3vw, 24px)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {language === 'ru' 
              ? 'Уникальная технология печати на текстиле с использованием 3D-печати из TPU'
              : 'Tehnologie unică de printare pe textile folosind printare 3D din TPU'}
          </p>
        </div>
      </section>

      {/* Technology */}
      <section style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '32px', textAlign: 'center' }}>
          {language === 'ru' ? '🔬 Технология' : '🔬 Tehnologie'}
        </h2>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: '16px'
        }}>
          <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '24px' }}>
            {language === 'ru'
              ? 'Печатаем дизайн из гибкого пластика TPU, через фольгу и утюг переносим на ткань. Пластик впитывается в текстуру ткани, создавая прочный принт.'
              : 'Printăm designul din TPU flexibil, transferăm pe țesătură prin folie și fier. Plasticul se absoarbe în textură, creând print durabil.'}
          </p>
        </div>
      </section>

      {/* Products */}
      <section style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '32px', textAlign: 'center' }}>
          {language === 'ru' ? '👕 На чём печатаем' : '👕 Pe ce printăm'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { name: language === 'ru' ? 'Футболки' : 'Tricouri', emoji: '👕' },
            { name: language === 'ru' ? 'Батники' : 'Bluze', emoji: '👔' },
            { name: language === 'ru' ? 'Худи' : 'Hanorace', emoji: '🧥' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-secondary)',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{item.emoji}</div>
              <h3 style={{ fontSize: '24px' }}>{item.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TextilePrint;

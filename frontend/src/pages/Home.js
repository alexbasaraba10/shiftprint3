import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import InstagramStories from '../components/InstagramStories';

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Services data
  const services = [
    {
      id: 1,
      image: "https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/kb55rmiz_20250923_205705%20%282%29.jpg",
      titleRu: '3D-моделирование и реверс-инжиниринг',
      titleRo: 'Modelare 3D și inginerie inversă',
      descRu: 'Создаём 3D-модели по эскизам, чертежам или физическим образцам. Восстанавливаем детали без документации.',
      descRo: 'Creăm modele 3D după schițe, desene sau mostre fizice. Restaurăm piese fără documentație.'
    },
    {
      id: 2,
      image: "https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/g7p3eqpc_hg7bvuelu0b9d62vovo5zl9ggv7lkiqo.jpg",
      titleRu: '3D-печать',
      titleRo: 'Imprimare 3D',
      descRu: 'Печать на современных FDM-принтерах. PLA, PETG, ABS, TPU и другие материалы. Точность до 0.1мм.',
      descRo: 'Imprimare pe imprimante FDM moderne. PLA, PETG, ABS, TPU și alte materiale. Precizie până la 0.1mm.'
    },
    {
      id: 3,
      image: "https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/zlo0qxbu_file_000000002c6c71f4b12c2b21b83fa631.png",
      titleRu: 'Сглаживание поверхности',
      titleRo: 'Netezirea suprafeței',
      descRu: 'Шлифовка, грунтовка и подготовка поверхности. Убираем слои печати для идеально гладкого результата.',
      descRo: 'Șlefuire, grunduire și pregătirea suprafeței. Eliminăm straturile de imprimare pentru un rezultat perfect neted.'
    },
    {
      id: 4,
      image: "https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/kexjlwqc_Screenshot_20251222_231032_YouTube.jpg",
      titleRu: 'Покраска',
      titleRo: 'Vopsire',
      descRu: 'Профессиональная покраска изделий. Металлик, матовые, глянцевые покрытия. Любые цвета и эффекты.',
      descRo: 'Vopsire profesională a produselor. Acoperiri metalice, mate, lucioase. Orice culori și efecte.'
    }
  ];

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gallery`);
        if (response.ok) {
          const data = await response.json();
          setGalleryItems(data.slice(0, 5)); // First 5 items
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      }
    };
    loadGallery();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }} className="home-page">
      {/* Hero Section with Video Background */}
      <section style={{
        position: 'relative',
        height: '85vh',
        minHeight: '550px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="https://customer-assets.emergentagent.com/job_f1d7a600-9be3-4269-857f-414a16853032/artifacts/mi7amiy6_lv_0_20251123134625.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '1200px',
          padding: '0 20px',
          marginTop: '5%',
          animation: 'heroFadeIn 1s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(42px, 7vw, 72px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'white',
            marginBottom: '24px',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {t('home.hero.title')}
          </h1>
          <p style={{ 
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)'
          }}>
            {t('home.hero.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              className="btn-primary"
              onClick={() => navigate('/calculator')}
              style={{
                animation: 'buttonFadeIn 0.6s ease-out 0.3s both'
              }}
            >
              {t('home.hero.ctaPrimary')}
            </Button>
            <Button 
              className="btn-secondary"
              onClick={() => navigate('/gallery')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                animation: 'buttonFadeIn 0.6s ease-out 0.4s both'
              }}
            >
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>
        </div>
      </section>

      {/* Keyframes for hero animations */}
      <style>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buttonFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .home-page section {
          animation: sectionSlideIn 0.7s ease-out both;
        }
        @keyframes sectionSlideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Stats Section - Apple Style */}
      <section style={{ 
        background: 'var(--bg-secondary)',
        padding: '80px 20px',
        marginBottom: '120px'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '48px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ 
              fontSize: '56px',
              fontWeight: 700,
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>24/7</div>
            <p style={{ fontSize: '19px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {language === 'ru' ? 'Работа принтеров' : 'Imprimante active'}
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '56px',
              fontWeight: 700,
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>3</div>
            <p style={{ fontSize: '19px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {language === 'ru' ? 'Дня на печать' : 'Zile pentru printare'}
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '48px',
              fontWeight: 700,
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>🚚</div>
            <p style={{ fontSize: '19px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {language === 'ru' ? 'Доставка по Кишинёву и в Бельцы' : 'Livrare în Chișinău și Bălți'}
            </p>
          </div>
        </div>
      </section>

      {/* Instagram Stories - Gallery Preview */}
      {galleryItems.length > 0 && (
        <section style={{
          maxWidth: '1400px',
          margin: '80px auto',
          padding: '0 20px'
        }}>
          <h2 style={{ 
            fontSize: '48px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            {language === 'ru' ? '📸 Наши проекты' : '📸 Proiectele noastre'}
          </h2>
          <InstagramStories items={galleryItems.map(item => ({
            ...item,
            title: language === 'ru' ? item.title : item.titleRo,
            description: language === 'ru' ? item.description : item.descriptionRo
          }))} />
        </section>
      )}

      {/* Services Section */}
      <section style={{ padding: '100px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 className="display-large" style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: 'var(--text-primary)'
        }}>
          {t('home.services.title')}
        </h2>
        <p className="body-large" style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 60px'
        }}>
          {language === 'ru' 
            ? 'Полный цикл услуг 3D печати - от идеи до готового изделия'
            : 'Ciclu complet de servicii de imprimare 3D - de la idee la produs finit'
          }
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Service 1: 3D Modeling */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          className="service-card"
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src="https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/kb55rmiz_20250923_205705%20%282%29.jpg"
                alt="3D моделирование"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                {language === 'ru' ? '3D-моделирование и реверс-инжиниринг' : 'Modelare 3D și inginerie inversă'}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {language === 'ru' 
                  ? 'Создаём 3D-модели по эскизам, чертежам или физическим образцам. Восстанавливаем детали без документации.'
                  : 'Creăm modele 3D după schițe, desene sau mostre fizice. Restaurăm piese fără documentație.'
                }
              </p>
            </div>
          </div>

          {/* Service 2: 3D Printing */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          className="service-card"
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src="https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/g7p3eqpc_hg7bvuelu0b9d62vovo5zl9ggv7lkiqo.jpg"
                alt="3D печать"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                {language === 'ru' ? '3D-печать' : 'Imprimare 3D'}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {language === 'ru' 
                  ? 'Печать на современных FDM-принтерах. PLA, PETG, ABS, TPU и другие материалы. Точность до 0.1мм.'
                  : 'Imprimare pe imprimante FDM moderne. PLA, PETG, ABS, TPU și alte materiale. Precizie până la 0.1mm.'
                }
              </p>
            </div>
          </div>

          {/* Service 3: Surface Smoothing */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          className="service-card"
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src="https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/zlo0qxbu_file_000000002c6c71f4b12c2b21b83fa631.png"
                alt="Сглаживание поверхности"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Сглаживание поверхности' : 'Netezirea suprafeței'}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {language === 'ru' 
                  ? 'Шлифовка, грунтовка и подготовка поверхности. Убираем слои печати для идеально гладкого результата.'
                  : 'Șlefuire, grunduire și pregătirea suprafeței. Eliminăm straturile de imprimare pentru un rezultat perfect neted.'
                }
              </p>
            </div>
          </div>

          {/* Service 4: Painting */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          className="service-card"
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src="https://customer-assets.emergentagent.com/job_06ead0f4-f0d5-420e-a22e-b3b41877c094/artifacts/kexjlwqc_Screenshot_20251222_231032_YouTube.jpg"
                alt="Покраска"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Покраска' : 'Vopsire'}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {language === 'ru' 
                  ? 'Профессиональная покраска изделий. Металлик, матовые, глянцевые покрытия. Любые цвета и эффекты.'
                  : 'Vopsire profesională a produselor. Acoperiri metalice, mate, lucioase. Orice culori și efecte.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 0',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-active) 100%)',
          padding: '80px 60px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="display-large" style={{ color: 'white', marginBottom: '24px' }}>
              {language === 'ru' ? 'Готовы начать?' : 'Gata să începem?'}
            </h2>
            <p className="body-large" style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              {language === 'ru' 
                ? 'Загрузите ваш 3D файл и получите расчёт стоимости за несколько минут'
                : 'Încărcați fișierul 3D și primiți calculul costului în câteva minute'
              }
            </p>
            <Button 
              className="btn-secondary"
              onClick={() => navigate('/calculator')}
              style={{ background: 'white', color: 'var(--brand-primary)', minHeight: '56px' }}
            >
              {language === 'ru' ? 'Рассчитать стоимость' : 'Calculează costul'}
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
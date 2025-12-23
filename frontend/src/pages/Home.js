import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Printer, Zap, Cpu, Sparkles } from 'lucide-react';
import PrinterCarousel from '../components/PrinterCarousel';
import InstagramStories from '../components/InstagramStories';

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);

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
    <div style={{ background: 'var(--bg-primary)' }}>
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

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '1200px',
          padding: '0 20px',
          marginTop: '10%'
        }}>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.015em',
            color: 'white',
            marginBottom: '24px',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
          }}>
            {t('home.hero.title')}
          </h1>
          <p style={{ 
            fontSize: 'clamp(21px, 3vw, 28px)',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            color: 'white',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            {t('home.hero.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              className="btn-primary"
              onClick={() => navigate('/calculator')}
            >
              {t('home.hero.ctaPrimary')}
            </Button>
            <Button 
              className="btn-secondary"
              onClick={() => navigate('/gallery')}
              style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>
        </div>
      </section>

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
      <section style={{ padding: '100px 0', maxWidth: '1400px', margin: '0 auto' }}>
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
            ? 'Профессиональная 3D печать для любых задач - от прототипов до серийного производства'
            : 'Imprimare 3D profesională pentru orice necesitate - de la prototipuri la producție serială'
          }
        </p>
        
        <div className="dark-grid">
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '40px',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.4s ease-in-out',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="service-card"
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Printer size={32} color="var(--brand-primary)" />
            </div>
            <h3 className="heading-1" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              {t('home.services.service1.title')}
            </h3>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              {t('home.services.service1.desc')}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '40px',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.4s ease-in-out',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="service-card"
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Sparkles size={32} color="var(--brand-primary)" />
            </div>
            <h3 className="heading-1" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              {t('home.services.service2.title')}
            </h3>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              {t('home.services.service2.desc')}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '40px',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.4s ease-in-out',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="service-card"
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--brand-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Cpu size={32} color="var(--brand-primary)" />
            </div>
            <h3 className="heading-1" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              {t('home.services.service3.title')}
            </h3>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              {t('home.services.service3.desc')}
            </p>
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
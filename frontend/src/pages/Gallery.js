import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockGalleryItems } from '../mock';
import { galleryAPI } from '../utils/api';

const Gallery = () => {
  const { t, language } = useLanguage();
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const data = await galleryAPI.getAll();
      setGalleryItems(data.length > 0 ? data : mockGalleryItems);
    } catch (error) {
      const saved = localStorage.getItem('gallery');
      setGalleryItems(saved ? JSON.parse(saved) : mockGalleryItems);
    }
  };

  return (
    <div className="dark-container" style={{ paddingTop: '140px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 className="display-large" style={{ marginBottom: '20px' }}>
          {t('gallery.title')}
        </h1>
        <p className="body-large" style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '60px' 
        }}>
          {t('gallery.subtitle')}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '40px'
        }}>
          {galleryItems.map((item) => (
            <div 
              key={item.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                transition: 'all 0.4s ease-in-out',
                cursor: 'pointer'
              }}
              className="gallery-card"
            >
              <div style={{
                width: '100%',
                height: '250px',
                overflow: 'hidden'
              }}>
                <img 
                  src={item.image} 
                  alt={language === 'ru' ? item.title : item.titleRo}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease-in-out'
                  }}
                  className="gallery-img"
                />
              </div>
              <div style={{ padding: '24px' }}>
                <h3 className="heading-2" style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {language === 'ru' ? item.title : item.titleRo}
                </h3>
                <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {item.material}
                </p>
                <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const OrderTrackingBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      color: 'white',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <Search size={24} />
        <div>
          <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '2px' }}>
            {language === 'ru' ? '📦 Где мой заказ?' : '📦 Unde este comanda mea?'}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.9 }}>
            {language === 'ru' ? 'Проверьте статус заказа в личном кабинете' : 'Verificați starea comenzii în contul personal'}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'white',
            color: '#0ea5e9',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {language === 'ru' ? 'Посмотреть' : 'Vezi'}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default OrderTrackingBanner;
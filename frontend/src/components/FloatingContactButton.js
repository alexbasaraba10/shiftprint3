import React, { useState } from 'react';
import { MessageCircle, Send, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Custom Viber icon as SVG
const ViberIcon = ({ size = 24, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.617 6.55 20.24h.005l-.004 2.416s-.037.98.61 1.177c.777.237 1.234-.5 1.98-1.302.407-.44.97-1.084 1.397-1.58 3.85.323 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546l-.01-.005C19.22.402 15.223.028 11.4 0zm.505 1.784l.01.005c3.486 0 7.014.342 8.653 1.776 1.737 1.513 2.61 4.978 1.926 10.39-.614 4.844-4.168 5.192-4.83 5.396-.29.09-2.886.737-6.195.48 0 0-2.445 2.946-3.198 3.705-.12.12-.26.167-.352.145-.13-.033-.166-.188-.165-.414l.02-4.018c-5.31-1.4-4.997-6.452-4.94-9.102.055-2.65.567-4.826 1.972-6.352 1.97-1.77 5.475-2 7.1-2.01zm.055 1.89c-.11-.004-.204.007-.305.02-.512.068-.94.478-.988 1.016-.053.627.36 1.13.975 1.186 2.95.27 5.33 2.65 5.602 5.602.056.615.558 1.027 1.186.975.537-.048.947-.476 1.015-.988.09-1.002-.2-3.537-2.045-5.382-1.845-1.845-4.38-2.135-5.382-2.045-.03-.002-.044-.003-.058-.003zm-3.05 2.654c-.238.006-.464.08-.65.183-.51.28-.95.852-1.254 1.695-.31.852-.32 1.813-.024 2.632.593 1.64 1.733 3.614 3.235 5.117s3.477 2.643 5.118 3.235c.82.297 1.78.286 2.633-.024.842-.304 1.414-.744 1.694-1.254.14-.255.21-.53.204-.818-.007-.282-.098-.557-.27-.78l-1.168-1.51c-.303-.39-.77-.593-1.25-.548-.48.046-.896.332-1.123.77l-.624.99c-.243.385-.695.556-1.106.436-1.006-.293-2.36-1.228-3.335-2.203-.976-.975-1.91-2.33-2.203-3.335-.12-.41.05-.863.436-1.106l.99-.624c.438-.227.724-.643.77-1.123.045-.48-.158-.947-.548-1.25l-1.51-1.168c-.17-.132-.368-.207-.573-.213z"/>
  </svg>
);

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const contacts = [
    {
      name: 'Telegram',
      icon: Send,
      url: 'https://t.me/Shiftprint',
      color: '#0088cc',
      delay: 0
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/37360972200',
      color: '#25D366',
      delay: 0.05
    },
    {
      name: 'Viber',
      customIcon: ViberIcon,
      url: 'viber://chat?number=%2B37360972200',
      color: '#7360f2',
      delay: 0.1
    },
    {
      name: 'Phone',
      icon: Phone,
      url: 'tel:+37360972200',
      color: '#34b7f1',
      delay: 0.15
    }
  ];

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999
      }}>
        {/* Label */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '10px',
            background: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap',
            animation: 'fadeInUp 0.3s ease-out',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--text-primary)'
          }}>
            {language === 'ru' ? 'Связь с оператором' : 'Contactați operatorul'}
          </div>
        )}

        {/* Contact Icons */}
        {isOpen && contacts.map((contact, index) => {
          const Icon = contact.icon;
          const CustomIcon = contact.customIcon;
          return (
            <a
              key={contact.name}
              href={contact.url}
              target={contact.name === 'Phone' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                bottom: `${140 + (index * 65)}px`,
                right: '10px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: contact.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: `slideInUp 0.4s ease-out ${contact.delay}s both`,
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
              }}
            >
              {CustomIcon ? <CustomIcon size={26} color="white" /> : <Icon size={26} color="white" />}
            </a>
          );
        })}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isOpen ? 'var(--text-primary)' : 'var(--brand-gradient)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 25px rgba(0, 150, 255, 0.4)',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'scale(1.1) rotate(0deg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }
          }}
        >
          {isOpen ? (
            <div style={{
              fontSize: '32px',
              fontWeight: 300,
              color: 'white',
              lineHeight: 1
            }}>×</div>
          ) : (
            <Send size={28} color="white" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingContactButton;

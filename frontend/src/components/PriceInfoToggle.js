import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PriceInfoToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <div style={{ marginBottom: '32px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'var(--brand-hover)',
          border: '2px solid var(--brand-primary)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--brand-primary)'
        }}
      >
        <span>❓ {language === 'ru' ? 'Как формируется цена за 3D-печать?' : 'Cum se formează prețul pentru printare 3D?'}</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      
      {isOpen && (
        <div style={{
          marginTop: '16px',
          padding: '32px',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--brand-primary)',
          borderRadius: '12px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 0 }}>
            {language === 'ru'
              ? 'Цена за 3D-печать формируется из стоимости материала, времени печати и самой главной составляющей — это человеческое время. Важно отметить, что 3D-принтер это станок со множеством параметров, нюансов и сложностей. И чтобы получилась действительно хорошая деталь, порой нужно часами подбирать настройки, печатать прототипы и усердно обрабатывать поверхность после печати.'
              : 'Prețul pentru printare 3D se formează din costul materialului, timpul de printare și componenta cea mai importantă — timpul uman. Este important de menționat că imprimanta 3D este o mașină cu multe parametri, nuanțe și complexități. Și pentru a obține o piesă cu adevărat bună, uneori trebuie să petreci ore întregi pentru a alege setările, a printa prototipuri și a procesa cu atenție suprafața după printare.'}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PriceInfoToggle;
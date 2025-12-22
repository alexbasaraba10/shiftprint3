import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Label } from './ui/label';

const LayerHeightSelector = ({ value, onChange }) => {
  const { language } = useLanguage();

  const layerHeights = [
    { value: '0.15', label: '0.15mm', desc: language === 'ru' ? 'Высокое качество, гладкая поверхность' : 'Calitate înaltă, suprafață netedă' },
    { value: '0.2', label: '0.2mm', desc: language === 'ru' ? 'Стандарт, оптимальное соотношение' : 'Standard, raport optim' },
    { value: '0.28', label: '0.28mm', desc: language === 'ru' ? 'Быстрая печать, грубоватая поверхность' : 'Printare rapidă, suprafață mai aspră' },
    { value: '0.32', label: '0.32mm', desc: language === 'ru' ? 'Максимальная скорость' : 'Viteză maximă' }
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 className="heading-3" style={{ marginBottom: '16px' }}>
        {language === 'ru' ? '🔬 Высота слоя' : '🔬 Înălțimea stratului'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {layerHeights.map((height) => (
          <div
            key={height.value}
            onClick={() => onChange(height.value)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${value === height.value ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
              background: value === height.value ? 'var(--brand-hover)' : 'var(--bg-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: value === height.value ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '8px', color: 'var(--brand-primary)' }}>
              {height.label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {height.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerHeightSelector;
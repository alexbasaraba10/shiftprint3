import React, { useState } from 'react';
import { Check } from 'lucide-react';

const ColorPicker = ({ selectedColors = [], onChange, label }) => {
  const colorOptions = [
    { ru: 'Белый', ro: 'Alb', hex: '#FFFFFF', border: true },
    { ru: 'Чёрный', ro: 'Negru', hex: '#000000' },
    { ru: 'Красный', ro: 'Roșu', hex: '#EF4444' },
    { ru: 'Синий', ro: 'Albastru', hex: '#3B82F6' },
    { ru: 'Зелёный', ro: 'Verde', hex: '#10B981' },
    { ru: 'Жёлтый', ro: 'Galben', hex: '#FBBF24' },
    { ru: 'Оранжевый', ro: 'Portocaliu', hex: '#F97316' },
    { ru: 'Фиолетовый', ro: 'Violet', hex: '#8B5CF6' },
    { ru: 'Розовый', ro: 'Roz', hex: '#EC4899' },
    { ru: 'Серый', ro: 'Gri', hex: '#6B7280' },
    { ru: 'Коричневый', ro: 'Maro', hex: '#92400E' },
    { ru: 'Прозрачный', ro: 'Transparent', hex: '#E0F2FE', special: 'transparent' }
  ];

  const toggleColor = (color) => {
    const colorName = color.ru;
    const isSelected = selectedColors.includes(colorName);
    
    let newColors;
    if (isSelected) {
      newColors = selectedColors.filter(c => c !== colorName);
    } else {
      newColors = [...selectedColors, colorName];
    }
    
    console.log('Toggling color:', colorName, 'New colors:', newColors);
    onChange(newColors);
  };

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '12px',
        color: 'var(--text-primary)'
      }}>
        {label}
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '12px'
      }}>
        {colorOptions.map((color) => {
          const isSelected = selectedColors.includes(color.ru);
          return (
            <div
              key={color.ru}
              onClick={() => toggleColor(color)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '12px',
                background: color.hex,
                border: color.border || isSelected ? `3px solid ${isSelected ? 'var(--brand-primary)' : '#e5e7eb'}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.1)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                position: 'relative'
              }}>
                {isSelected && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={18} color="white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)'
              }}>
                {color.ru}
              </div>
            </div>
          );
        })}
      </div>
      {selectedColors.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'var(--brand-hover)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-primary)'
        }}>
          <strong>Выбрано:</strong> {selectedColors.join(', ')}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;

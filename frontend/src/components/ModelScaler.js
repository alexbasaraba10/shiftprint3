import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ModelScaler = ({ dimensions, onScaleChange }) => {
  const { language } = useLanguage();
  const [scale, setScale] = useState(1);
  const maxBuildVolume = { x: 300, y: 300, z: 330 };

  const handleScaleChange = (newScale) => {
    // Calculate new dimensions
    const newDims = {
      x: dimensions.x * newScale,
      y: dimensions.y * newScale,
      z: dimensions.z * newScale
    };

    // Check if within build volume
    if (newDims.x <= maxBuildVolume.x && 
        newDims.y <= maxBuildVolume.y && 
        newDims.z <= maxBuildVolume.z) {
      setScale(newScale);
      onScaleChange(newScale);
    } else {
      // Find maximum allowed scale
      const maxScaleX = maxBuildVolume.x / dimensions.x;
      const maxScaleY = maxBuildVolume.y / dimensions.y;
      const maxScaleZ = maxBuildVolume.z / dimensions.z;
      const maxAllowedScale = Math.min(maxScaleX, maxScaleY, maxScaleZ);
      
      setScale(maxAllowedScale);
      onScaleChange(maxAllowedScale);
    }
  };

  const scaledDims = {
    x: (dimensions.x * scale).toFixed(1),
    y: (dimensions.y * scale).toFixed(1),
    z: (dimensions.z * scale).toFixed(1)
  };

  const isMaxSize = scaledDims.x >= maxBuildVolume.x || 
                    scaledDims.y >= maxBuildVolume.y || 
                    scaledDims.z >= maxBuildVolume.z;

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      padding: '32px',
      borderRadius: '12px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
        📏 {language === 'ru' ? 'Масштабирование модели' : 'Scalare model'}
      </h3>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {language === 'ru' ? 'Масштаб:' : 'Scală:'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-primary)' }}>
            {(scale * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={scale}
          onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${(scale / 5) * 100}%, var(--border-medium) ${(scale / 5) * 100}%, var(--border-medium) 100%)`,
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>10%</span>
          <span>250%</span>
          <span>500%</span>
        </div>
      </div>

      {/* Dimensions Display */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '20px',
        borderRadius: '8px',
        border: isMaxSize ? '2px solid #f59e0b' : '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: language === 'ru' ? 'Длина' : 'Lungime', value: scaledDims.x, max: maxBuildVolume.x, unit: 'X' },
            { label: language === 'ru' ? 'Ширина' : 'Lățime', value: scaledDims.y, max: maxBuildVolume.y, unit: 'Y' },
            { label: language === 'ru' ? 'Высота' : 'Înălțime', value: scaledDims.z, max: maxBuildVolume.z, unit: 'Z' }
          ].map((dim) => (
            <div key={dim.unit} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {dim.label} ({dim.unit})
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: dim.value >= dim.max ? '#f59e0b' : 'var(--brand-primary)' 
              }}>
                {dim.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                max {dim.max}mm
              </div>
            </div>
          ))}
        </div>
        
        {isMaxSize && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '13px',
            color: '#92400e'
          }}>
            ⚠️ {language === 'ru' 
              ? 'Модель достигла максимального размера рабочего поля (300x300x330мм)'
              : 'Modelul a atins dimensiunea maximă a zonei de printare (300x300x330mm)'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelScaler;
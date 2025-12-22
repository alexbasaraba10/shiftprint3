import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const PrinterCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const printers = [
    {
      id: 1,
      name: 'Профессиональная 3D Печать и Реверс-Инжиниринг',
      nameRo: 'Imprimare 3D Profesională și Inginerie Inversă',
      video: 'https://customer-assets.emergentagent.com/job_f1d7a600-9be3-4269-857f-414a16853032/artifacts/mi7amiy6_lv_0_20251123134625.mp4',
      description: 'Профессиональная FDM печать и реверс-инжиниринг',
      descriptionRo: 'Imprimare FDM profesională și inginerie inversă'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % printers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + printers.length) % printers.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'clamp(300px, 60vw, 700px)',
        overflow: 'hidden',
        borderRadius: '0px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Container */}
      <div style={{
        display: 'flex',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `translateX(-${currentIndex * 100}%)`,
        height: '100%'
      }}>
        {printers.map((printer) => (
          <div 
            key={printer.id}
            style={{
              minWidth: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <video
              src={printer.video}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: 'none'
              }}
            />
            
            {/* Info Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
              padding: '40px',
              color: 'white'
            }}>
              <h3 className="heading-1" style={{ color: 'white', marginBottom: '8px' }}>
                {printer.name}
              </h3>
              <p className="body-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {printer.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* No navigation needed - single video */}
    </div>
  );
};

export default PrinterCarousel;
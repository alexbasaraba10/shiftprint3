import React, { useState, useEffect, useCallback } from 'react';

const InstagramStories = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const STORY_DURATION = 5000; // 5 seconds per story
  const UPDATE_INTERVAL = 50;

  const goToNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Loop back to first
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [currentIndex, items.length]);

  const goToPrev = useCallback(() => {
    if (progress > 20) {
      // If more than 20% watched, restart current story
      setProgress(0);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex, progress]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const increment = (UPDATE_INTERVAL / STORY_DURATION) * 100;
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + increment;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        aspectRatio: '9/16',
        maxHeight: '75vh',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#000',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onClick={handleClick}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars at top - Instagram style */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        zIndex: 20,
        display: 'flex',
        gap: '4px',
        padding: '4px'
      }}>
        {items.map((_, idx) => (
          <div 
            key={idx} 
            style={{
              flex: 1,
              height: '2px',
              background: 'rgba(255,255,255,0.35)',
              borderRadius: '1px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%',
                height: '100%',
                background: 'white',
                borderRadius: '1px',
                transition: idx === currentIndex ? 'none' : 'width 0.2s ease'
              }} 
            />
          </div>
        ))}
      </div>

      {/* Story Image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000'
      }}>
        <img
          src={currentItem.image || currentItem.imageUrl}
          alt={currentItem.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          draggable={false}
        />
      </div>

      {/* Gradient overlay for text */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
        pointerEvents: 'none'
      }} />

      {/* Top gradient for progress bars */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
        pointerEvents: 'none'
      }} />

      {/* Story info - Instagram style */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 15
      }}>
        {/* Avatar placeholder */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 700
        }}>
          SP
        </div>
        <div>
          <p style={{ 
            color: 'white', 
            fontWeight: 600, 
            fontSize: '13px',
            margin: 0,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            ShiftPrint
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '11px',
            margin: 0
          }}>
            {currentIndex + 1} из {items.length}
          </p>
        </div>
      </div>

      {/* Content overlay at bottom */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '16px',
        right: '16px',
        zIndex: 15,
        color: 'white'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {currentItem.title}
        </h3>
        {currentItem.description && (
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.9,
            lineHeight: 1.4,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            {currentItem.description}
          </p>
        )}
        {currentItem.material && (
          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            fontSize: '12px'
          }}>
            🎨 {currentItem.material}
          </div>
        )}
      </div>

      {/* Tap zones indicator (subtle) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        pointerEvents: 'none'
      }}>
        <div style={{ flex: 1 }} /> {/* Left tap zone */}
        <div style={{ flex: 2 }} /> {/* Right tap zone */}
      </div>
    </div>
  );
};

export default InstagramStories;

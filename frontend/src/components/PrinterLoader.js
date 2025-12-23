import React from 'react';
import './PrinterLoader.css';

const PrinterLoader = ({ size = 'medium', text = 'ShiftPrint' }) => {
  const sizeClass = size === 'small' ? 'printer-small' : size === 'large' ? 'printer-large' : '';
  
  return (
    <div className={`printer-loader-container ${sizeClass}`}>
      {/* Typing text animation */}
      <div className="typing-animation">
        <div className="typing-text">
          {text.split('').map((char, index) => (
            <span 
              key={index} 
              className="typing-char"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="typing-cursor">|</div>
      </div>
      
      {/* 3D Printer illustration */}
      <div className="printer-3d-illustration">
        <div className="printer-3d-body">
          {/* Vertical frame pillars */}
          <div className="frame-pillar left"></div>
          <div className="frame-pillar right"></div>
          
          {/* Top horizontal bar with Z-axis */}
          <div className="top-bar">
            <div className="z-motor"></div>
          </div>
          
          {/* Moving print head (X-carriage) */}
          <div className="x-carriage">
            <div className="extruder">
              <div className="nozzle"></div>
              <div className="filament-drip"></div>
            </div>
          </div>
          
          {/* Build plate */}
          <div className="build-plate">
            {/* Printed object growing */}
            <div className="printed-object">
              <div className="layer layer-1"></div>
              <div className="layer layer-2"></div>
              <div className="layer layer-3"></div>
              <div className="layer layer-4"></div>
            </div>
          </div>
          
          {/* Base */}
          <div className="printer-3d-base">
            <div className="control-box">
              <div className="lcd-screen"></div>
              <div className="status-led"></div>
            </div>
          </div>
          
          {/* Filament spool */}
          <div className="filament-holder">
            <div className="spool">
              <div className="spool-inner"></div>
            </div>
            <div className="filament-line"></div>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="loading-indicator">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <span className="loading-text">Загрузка...</span>
      </div>
    </div>
  );
};

export default PrinterLoader;

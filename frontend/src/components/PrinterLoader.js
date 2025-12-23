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
      
      {/* Simple realistic 3D Printer */}
      <div className="printer-3d-container">
        <div className="printer-3d">
          {/* Frame */}
          <div className="frame-left"></div>
          <div className="frame-right"></div>
          <div className="frame-top"></div>
          
          {/* Moving carriage with extruder */}
          <div className="carriage">
            <div className="extruder-block">
              <div className="hot-end"></div>
            </div>
          </div>
          
          {/* Build plate */}
          <div className="build-plate">
            <div className="printed-layers">
              <div className="layer"></div>
              <div className="layer"></div>
              <div className="layer"></div>
            </div>
          </div>
          
          {/* Base with LCD */}
          <div className="printer-base">
            <div className="lcd-display">
              <div className="lcd-progress"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading bar */}
      <div className="loading-bar-container">
        <div className="loading-bar-bg">
          <div className="loading-bar-fill"></div>
        </div>
        <span className="loading-text-small">Загрузка...</span>
      </div>
    </div>
  );
};

export default PrinterLoader;

import React from 'react';
import './PrinterLoader.css';

const PrinterLoader = ({ size = 'medium', text = '' }) => {
  const sizeClass = size === 'small' ? 'printer-small' : size === 'large' ? 'printer-large' : '';
  
  return (
    <div className={`printer-loader-container ${sizeClass}`}>
      {/* Typing text animation */}
      <div className="typing-animation">
        <div className="typing-text">
          {(text || 'ShiftPrint').split('').map((char, index) => (
            <span 
              key={index} 
              className="typing-char"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="typing-cursor">|</div>
      </div>
      
      {/* Printer illustration */}
      <div className="printer-illustration">
        <div className="printer-body">
          {/* Paper coming out */}
          <div className="paper-slot">
            <div className="paper">
              <div className="print-line line-1"></div>
              <div className="print-line line-2"></div>
              <div className="print-line line-3"></div>
            </div>
          </div>
          {/* Printer top */}
          <div className="printer-top">
            <div className="printer-display">
              <div className="display-dot"></div>
              <div className="display-dot"></div>
              <div className="display-dot"></div>
            </div>
          </div>
          {/* Printer base */}
          <div className="printer-base">
            <div className="printer-tray"></div>
          </div>
        </div>
      </div>
      
      {/* Loading dots */}
      <div className="loading-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
};

export default PrinterLoader;

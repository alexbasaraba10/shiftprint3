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
      
      {/* Printer illustration - more like actual printer */}
      <div className="printer-illustration">
        <div className="printer-body">
          {/* Paper slot and paper animation */}
          <div className="paper-output-area">
            <div className="paper-coming-out">
              <div className="printed-text-line"></div>
              <div className="printed-text-line short"></div>
              <div className="printed-text-line medium"></div>
            </div>
          </div>
          
          {/* Printer top section with feeder */}
          <div className="printer-top-section">
            <div className="paper-input-tray"></div>
          </div>
          
          {/* Main printer body */}
          <div className="printer-main">
            <div className="printer-display-panel">
              <div className="status-led active"></div>
              <div className="status-led"></div>
            </div>
            <div className="printer-vent-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          {/* Printer base/tray */}
          <div className="printer-output-tray"></div>
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

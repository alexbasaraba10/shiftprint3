import React from 'react';
import './PrinterLoader.css';

const PrinterLoader = ({ size = 'medium', text = '' }) => {
  const sizeClass = size === 'small' ? 'printer-small' : size === 'large' ? 'printer-large' : '';
  
  return (
    <div className={`printer-loader-container ${sizeClass}`}>
      <div className="printer-3d">
        {/* Printer frame */}
        <div className="printer-frame">
          {/* Top bar with logo */}
          <div className="printer-top-bar">
            <div className="printer-logo"></div>
          </div>
          
          {/* Print bed */}
          <div className="print-bed">
            <div className="bed-surface"></div>
          </div>
          
          {/* Print head / extruder */}
          <div className="print-head">
            <div className="extruder">
              <div className="nozzle"></div>
            </div>
          </div>
          
          {/* Object being printed */}
          <div className="printed-object">
            <div className="layer layer-1"></div>
            <div className="layer layer-2"></div>
            <div className="layer layer-3"></div>
            <div className="layer layer-4"></div>
            <div className="layer layer-5"></div>
          </div>
          
          {/* Filament spool */}
          <div className="filament-spool">
            <div className="spool-center"></div>
          </div>
          
          {/* Filament line */}
          <div className="filament-line"></div>
        </div>
      </div>
      
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default PrinterLoader;

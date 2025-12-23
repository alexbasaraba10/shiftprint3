import React from 'react';
import PrinterLoader from './PrinterLoader';

const PageLoader = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeInLoader 0.2s ease-out'
    }}>
      <PrinterLoader size="medium" text="ShiftPrint" />
      
      <style>{`
        @keyframes fadeInLoader {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;

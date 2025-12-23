import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import AppleHeader from "./components/AppleHeader";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Shop from "./pages/Shop";
import Calculator from "./pages/Calculator";
import Contacts from "./pages/Contacts";
import Admin from "./pages/Admin";
import FloatingContactButton from "./components/FloatingContactButton";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";
import OrderStatusTracker from "./components/OrderStatusTracker";
import PrinterLoader from "./components/PrinterLoader";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Initial page load animation
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const loadTimer = setTimeout(() => setIsLoading(false), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  return (
    <LanguageProvider>
      {/* Полупрозрачный загрузочный экран */}
      {isLoading && (
        <div 
          className="loading-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          <PrinterLoader size="large" text="ShiftPrint" />
        </div>
      )}
      
      <BrowserRouter>
        <ScrollToTop />
        <div className="App page-transition">
          <AppleHeader />
          <div style={{ paddingTop: '48px' }} className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <Footer />
          <FloatingContactButton />
          <OrderStatusTracker />
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;

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

  useEffect(() => {
    // Initial page load animation
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LanguageProvider>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <PrinterLoader size="large" text="ShiftPrint" />
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="App">
          <AppleHeader />
          <div style={{ paddingTop: '48px' }}>
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

import React from "react";
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

function App() {
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

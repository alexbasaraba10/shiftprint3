import React, { useState } from 'react';
import { X, Phone, User, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [method, setMethod] = useState(null); // null, 'phone', 'google'
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+373');
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for better user info
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      // Store email for discount tracking
      localStorage.setItem('userEmail', user.email || '');
      
      toast.success(language === 'ru' ? 'Вход через Google успешен!' : 'Autentificare Google reușită!');
      setMethod('google');
    } catch (error) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup - don't show error
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error(language === 'ru' 
          ? 'Домен не авторизован в Firebase. Используйте форму с телефоном.' 
          : 'Domeniul nu este autorizat în Firebase. Utilizați formularul cu telefon.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error(language === 'ru' 
          ? 'Popup заблокирован браузером. Разрешите popup-окна.' 
          : 'Popup blocat de browser. Permiteți ferestrele popup.');
      } else {
        toast.error(language === 'ru' ? 'Ошибка входа через Google' : 'Eroare autentificare Google');
      }
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!firstName.trim()) {
      toast.error(language === 'ru' ? 'Введите имя' : 'Introduceți prenumele');
      return;
    }
    if (!phone || phone.length < 10) {
      toast.error(language === 'ru' ? 'Введите номер телефона' : 'Introduceți numărul de telefon');
      return;
    }

    const userData = {
      firstName,
      lastName,
      phone,
      authMethod: method || 'phone',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(language === 'ru' ? '✅ Заказ оформлен!' : '✅ Comandă plasată!');
    onSuccess(userData);
    handleClose();
  };

  const handleClose = () => {
    setMethod(null);
    setFirstName('');
    setLastName('');
    setPhone('+373');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: '20px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '460px',
        padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={handleClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: '#f3f4f6',
            border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
          <X size={20} color="#666" />
        </button>

        {/* Choose method screen */}
        {!method && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.5)'
              }}>
                <User size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#111' }}>
                {language === 'ru' ? 'Оформление заказа' : 'Plasare comandă'}
              </h2>
            </div>

            {/* Option 1: One-time order */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {language === 'ru' ? 'Одноразовый заказ' : 'Comandă unică'}
              </div>
              <button onClick={() => setMethod('phone')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px',
                  borderRadius: '14px', border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer',
                  transition: 'all 0.2s ease', textAlign: 'left'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#111', marginBottom: '2px' }}>
                    {language === 'ru' ? 'Оформить по номеру телефона' : 'Plasează cu numărul de telefon'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {language === 'ru' ? 'Быстро и просто' : 'Rapid și simplu'}
                  </div>
                </div>
                <ArrowRight size={20} color="#10b981" style={{ marginLeft: 'auto' }} />
              </button>
            </div>

            {/* Option 2: Multi-order (Google) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {language === 'ru' ? 'Для многоразовых заказов' : 'Pentru comenzi multiple'}
              </div>
              <button onClick={handleGoogleAuth} disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px',
                  borderRadius: '14px', border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer',
                  transition: 'all 0.2s ease', textAlign: 'left'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4285f4'; e.currentTarget.style.background = 'rgba(66, 133, 244, 0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: '2px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#111', marginBottom: '2px' }}>
                    {language === 'ru' ? 'Войти через Google' : 'Conectare cu Google'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {language === 'ru' ? 'Личный кабинет и скидки' : 'Cabinet personal și reduceri'}
                  </div>
                </div>
                {loading ? <Loader2 className="animate-spin" size={20} style={{ marginLeft: 'auto' }} /> : 
                  <ArrowRight size={20} color="#4285f4" style={{ marginLeft: 'auto' }} />}
              </button>

              {/* Google benefits */}
              <div style={{ marginTop: '12px', padding: '14px 16px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#666' }}>
                💡 {language === 'ru' 
                  ? 'При входе через Google у вас будет доступ к информации о заказе, личному кабинету, скидкам и предложениям.'
                  : 'La conectarea prin Google veți avea acces la informații despre comandă, cabinet personal, reduceri și oferte.'}
              </div>
            </div>
          </>
        )}

        {/* Phone form */}
        {method === 'phone' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
              }}>
                <Phone size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111' }}>
                {language === 'ru' ? 'Контактные данные' : 'Date de contact'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Имя' : 'Prenume'} *
                </Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder={language === 'ru' ? 'Иван' : 'Ion'}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }} />
              </div>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Фамилия' : 'Nume'}
                </Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder={language === 'ru' ? 'Иванов' : 'Ionescu'}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                {language === 'ru' ? 'Номер телефона' : 'Telefon'} *
              </Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+373 XX XXX XXX"
                style={{ fontSize: '18px', padding: '14px', borderRadius: '10px', fontFamily: 'monospace' }} />
            </div>

            <Button onClick={handleSubmit} className="btn-primary"
              style={{ width: '100%', height: '52px', fontSize: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              {language === 'ru' ? 'Оформить заказ' : 'Plasează comanda'}
              <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Button>

            <button onClick={() => setMethod(null)}
              style={{ marginTop: '14px', width: '100%', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}>
              {language === 'ru' ? '← Назад' : '← Înapoi'}
            </button>
          </>
        )}

        {/* Google form (after Google login) */}
        {method === 'google' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                {language === 'ru' ? 'Добро пожаловать!' : 'Bine ați venit!'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? 'Осталось указать номер телефона' : 'Mai rămâne să indicați numărul de telefon'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Имя' : 'Prenume'}
                </Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }} />
              </div>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Фамилия' : 'Nume'}
                </Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                {language === 'ru' ? 'Номер телефона' : 'Telefon'} *
              </Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+373 XX XXX XXX"
                style={{ fontSize: '18px', padding: '14px', borderRadius: '10px', fontFamily: 'monospace' }} />
            </div>

            <Button onClick={handleSubmit} className="btn-primary"
              style={{ width: '100%', height: '52px', fontSize: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)' }}>
              {language === 'ru' ? 'Оформить заказ' : 'Plasează comanda'}
              <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Button>

            <button onClick={() => setMethod(null)}
              style={{ marginTop: '14px', width: '100%', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}>
              {language === 'ru' ? '← Назад' : '← Înapoi'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

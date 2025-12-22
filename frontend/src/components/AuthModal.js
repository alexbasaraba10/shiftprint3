import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Loader2, ArrowRight, Chrome } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState('choose'); // choose -> email/google/telegram -> phone -> done
  const [authMethod, setAuthMethod] = useState(null);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+373');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Telegram widget
  useEffect(() => {
    if (step === 'telegram' && isOpen) {
      loadTelegramWidget();
    }
  }, [step, isOpen]);

  const loadTelegramWidget = () => {
    // Telegram login callback
    window.onTelegramAuth = (user) => {
      console.log('Telegram user:', user);
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      // Telegram provides phone if user allowed
      if (user.phone_number) {
        setPhone(user.phone_number);
      }
      toast.success(language === 'ru' ? 'Вход через Telegram успешен!' : 'Autentificare Telegram reușită!');
      setStep('phone');
    };
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error(language === 'ru' ? 'Заполните email и пароль' : 'Completați email și parola');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success(language === 'ru' ? 'Вход выполнен!' : 'Autentificare reușită!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success(language === 'ru' ? 'Регистрация успешна!' : 'Înregistrare reușită!');
      }
      setStep('phone');
    } catch (error) {
      console.error('Email auth error:', error);
      let errorMsg = language === 'ru' ? 'Ошибка авторизации' : 'Eroare de autentificare';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = language === 'ru' ? 'Email уже используется. Войдите в аккаунт.' : 'Email-ul este deja utilizat. Conectați-vă.';
        setIsLogin(true);
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = language === 'ru' ? 'Неверный пароль' : 'Parolă incorectă';
      } else if (error.code === 'auth/user-not-found') {
        errorMsg = language === 'ru' ? 'Пользователь не найден. Зарегистрируйтесь.' : 'Utilizator negăsit. Înregistrați-vă.';
        setIsLogin(false);
      } else if (error.code === 'auth/weak-password') {
        errorMsg = language === 'ru' ? 'Пароль слишком простой (минимум 6 символов)' : 'Parola este prea simplă (minim 6 caractere)';
      }
      
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Extract name from Google account
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      
      toast.success(language === 'ru' ? 'Вход через Google успешен!' : 'Autentificare Google reușită!');
      setStep('phone');
    } catch (error) {
      console.error('Google auth error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(language === 'ru' ? 'Ошибка входа через Google' : 'Eroare autentificare Google');
      }
    }
    setLoading(false);
  };

  const handleTelegramAuth = () => {
    // Open Telegram auth in new window
    const botUsername = 'shiftprint_bot';
    const redirectUrl = encodeURIComponent(window.location.origin + '/telegram-callback');
    window.open(
      `https://oauth.telegram.org/auth?bot_id=8379725170&origin=${encodeURIComponent(window.location.origin)}&request_access=write`,
      'telegram_auth',
      'width=550,height=450'
    );
    
    // For now, just move to phone step with manual entry
    toast.info(language === 'ru' ? 'Введите данные вручную' : 'Introduceți datele manual');
    setStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (!firstName.trim()) {
      toast.error(language === 'ru' ? 'Введите имя' : 'Introduceți prenumele');
      return;
    }
    if (!phone || phone.length < 10) {
      toast.error(language === 'ru' ? 'Введите номер телефона' : 'Introduceți numărul de telefon');
      return;
    }

    // Save user data
    const userData = {
      email,
      firstName,
      lastName,
      phone,
      authMethod,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(language === 'ru' ? '✅ Данные сохранены!' : '✅ Date salvate!');
    onSuccess(userData);
    handleClose();
  };

  const handleClose = () => {
    setStep('choose');
    setAuthMethod(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('+373');
    setIsLogin(false);
    onClose();
  };

  const selectMethod = (method) => {
    setAuthMethod(method);
    if (method === 'email') {
      setStep('email');
    } else if (method === 'google') {
      handleGoogleAuth();
    } else if (method === 'telegram') {
      setStep('phone'); // Go directly to phone/name entry
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
        >
          <X size={20} color="#666" />
        </button>

        {/* Step 1: Choose method */}
        {step === 'choose' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px -8px rgba(14, 165, 233, 0.5)'
              }}>
                <User size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#111' }}>
                {language === 'ru' ? 'Оформление заказа' : 'Plasare comandă'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? 'Выберите способ входа' : 'Alegeți metoda de autentificare'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Google */}
              <button
                onClick={() => selectMethod('google')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{language === 'ru' ? 'Войти через Google' : 'Conectare cu Google'}</span>
                {loading && authMethod === 'google' && <Loader2 className="animate-spin" size={18} style={{ marginLeft: 'auto' }} />}
              </button>

              {/* Telegram */}
              <button
                onClick={() => selectMethod('telegram')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#0088cc'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span>{language === 'ru' ? 'Продолжить' : 'Continuă'}</span>
              </button>

              {/* Email */}
              <button
                onClick={() => selectMethod('email')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <Mail size={24} color="#6366f1" />
                <span>{language === 'ru' ? 'Войти по Email' : 'Conectare cu Email'}</span>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Email auth */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <Mail size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: '#111' }}>
                {isLogin 
                  ? (language === 'ru' ? 'Вход' : 'Conectare')
                  : (language === 'ru' ? 'Регистрация' : 'Înregistrare')
                }
              </h2>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                {language === 'ru' ? 'Пароль' : 'Parolă'}
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
              />
            </div>

            <Button
              onClick={handleEmailAuth}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '50px', fontSize: '16px', borderRadius: '12px', marginBottom: '12px' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                isLogin 
                  ? (language === 'ru' ? 'Войти' : 'Conectare')
                  : (language === 'ru' ? 'Зарегистрироваться' : 'Înregistrare')
              )}
            </Button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            >
              {isLogin 
                ? (language === 'ru' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Nu aveți cont? Înregistrați-vă')
                : (language === 'ru' ? 'Уже есть аккаунт? Войдите' : 'Aveți deja cont? Conectați-vă')
              }
            </button>

            <button
              onClick={() => setStep('choose')}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {language === 'ru' ? '← Другой способ входа' : '← Altă metodă'}
            </button>
          </>
        )}

        {/* Step 3: Phone & Name */}
        {step === 'phone' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <Phone size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: '#111' }}>
                {language === 'ru' ? 'Контактные данные' : 'Date de contact'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? 'Для связи по заказу' : 'Pentru contact privind comanda'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Имя' : 'Prenume'} *
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={language === 'ru' ? 'Иван' : 'Ion'}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }}
                />
              </div>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {language === 'ru' ? 'Фамилия' : 'Nume'}
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={language === 'ru' ? 'Иванов' : 'Ionescu'}
                  style={{ fontSize: '16px', padding: '12px', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '6px', display: 'block', fontWeight: 600, fontSize: '14px' }}>
                {language === 'ru' ? 'Номер телефона' : 'Telefon'} *
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+373 XX XXX XXX"
                style={{ fontSize: '18px', padding: '14px', borderRadius: '10px', fontFamily: 'monospace' }}
              />
            </div>

            <Button
              onClick={handlePhoneSubmit}
              className="btn-primary"
              style={{ 
                width: '100%', 
                height: '50px', 
                fontSize: '16px', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}
            >
              {language === 'ru' ? 'Оформить заказ' : 'Plasează comanda'}
              <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Button>

            <button
              onClick={() => setStep('choose')}
              style={{
                marginTop: '14px',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {language === 'ru' ? '← Назад' : '← Înapoi'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

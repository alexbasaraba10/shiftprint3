import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, User, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState('name'); // name -> phone -> otp
  const [phone, setPhone] = useState('+373');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaContainerRef = useRef(null);

  // Initialize reCAPTCHA when modal opens and step is phone
  useEffect(() => {
    if (isOpen && step === 'phone' && !window.recaptchaVerifier) {
      initRecaptcha();
    }
    
    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, [isOpen, step]);

  const initRecaptcha = () => {
    try {
      // Clear any existing verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }

      // Create new verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal', // Use normal size for better visibility
        callback: (response) => {
          console.log('reCAPTCHA verified');
          setRecaptchaReady(true);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setRecaptchaReady(false);
          toast.warning(language === 'ru' ? 'reCAPTCHA истекла. Пожалуйста, повторите.' : 'reCAPTCHA a expirat. Vă rugăm să repetați.');
        }
      });

      // Render the reCAPTCHA
      window.recaptchaVerifier.render().then((widgetId) => {
        console.log('reCAPTCHA rendered, widgetId:', widgetId);
      }).catch((error) => {
        console.error('reCAPTCHA render error:', error);
      });
    } catch (error) {
      console.error('reCAPTCHA init error:', error);
    }
  };

  const handleNameSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(language === 'ru' ? 'Заполните имя и фамилию' : 'Completați numele și prenumele');
      return;
    }
    setStep('phone');
  };

  const handleSendOTP = async () => {
    if (phone.length < 12) {
      toast.error(language === 'ru' ? 'Введите корректный номер телефона' : 'Introduceți un număr de telefon valid');
      return;
    }

    if (!window.recaptchaVerifier) {
      toast.error(language === 'ru' ? 'Пожалуйста, подтвердите reCAPTCHA' : 'Vă rugăm să confirmați reCAPTCHA');
      initRecaptcha();
      return;
    }

    setLoading(true);
    try {
      console.log('Sending OTP to:', phone);
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      console.log('OTP sent successfully');
      setConfirmationResult(confirmation);
      setStep('otp');
      toast.success(language === 'ru' ? 'SMS код отправлен!' : 'Cod SMS trimis!');
    } catch (error) {
      console.error('OTP error:', error);
      
      let errorMessage = language === 'ru' ? 'Ошибка отправки SMS.' : 'Eroare la trimiterea SMS.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = language === 'ru' ? 'Неверный формат номера телефона' : 'Format invalid al numărului de telefon';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = language === 'ru' ? 'Слишком много попыток. Попробуйте позже.' : 'Prea multe încercări. Încercați mai târziu.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = language === 'ru' ? 'Превышен лимит SMS. Попробуйте позже.' : 'Limita SMS depășită. Încercați mai târziu.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = language === 'ru' ? 'Ошибка проверки reCAPTCHA. Попробуйте ещё раз.' : 'Eroare verificare reCAPTCHA. Încercați din nou.';
      }
      
      toast.error(errorMessage);
      
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      setRecaptchaReady(false);
      
      // Re-init after a delay
      setTimeout(() => {
        initRecaptcha();
      }, 1000);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error(language === 'ru' ? 'Введите 6-значный код' : 'Introduceți codul de 6 cifre');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      
      // Save user data
      const userData = {
        phone,
        firstName,
        lastName,
        verified: true,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(language === 'ru' ? '✅ Номер подтверждён!' : '✅ Număr confirmat!');
      onSuccess(userData);
      handleClose();
    } catch (error) {
      console.error('Verify error:', error);
      
      let errorMessage = language === 'ru' ? 'Неверный код.' : 'Cod invalid.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = language === 'ru' ? 'Неверный код подтверждения' : 'Cod de verificare invalid';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = language === 'ru' ? 'Код истёк. Запросите новый.' : 'Codul a expirat. Solicitați unul nou.';
      }
      
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    // Reset everything and go back to phone step
    setOtp('');
    setConfirmationResult(null);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    setRecaptchaReady(false);
    setStep('phone');
    
    // Re-init recaptcha
    setTimeout(() => {
      initRecaptcha();
    }, 500);
  };

  const handleClose = () => {
    // Reset state
    setStep('name');
    setPhone('+373');
    setOtp('');
    setFirstName('');
    setLastName('');
    setConfirmationResult(null);
    setRecaptchaReady(false);
    
    // Clear recaptcha
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    
    onClose();
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
        maxWidth: '440px',
        padding: '36px',
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
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} color="#666" />
        </button>

        {/* Step indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '28px' 
        }}>
          {['name', 'phone', 'otp'].map((s, i) => (
            <div
              key={s}
              style={{
                width: step === s ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: ['name', 'phone', 'otp'].indexOf(step) >= i 
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' 
                  : '#e5e7eb',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 'name' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 30px -10px rgba(14, 165, 233, 0.5)'
              }}>
                <User size={36} color="white" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '10px', color: '#111' }}>
                {language === 'ru' ? 'Оформление заказа' : 'Plasare comandă'}
              </h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5 }}>
                {language === 'ru' 
                  ? 'Введите ваши данные для связи' 
                  : 'Introduceți datele dvs. de contact'}
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <Label style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                {language === 'ru' ? 'Имя' : 'Prenume'} *
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={language === 'ru' ? 'Иван' : 'Ion'}
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <Label style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                {language === 'ru' ? 'Фамилия' : 'Nume'} *
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={language === 'ru' ? 'Иванов' : 'Ionescu'}
                style={{ fontSize: '16px', padding: '14px', borderRadius: '12px' }}
              />
            </div>

            <Button
              onClick={handleNameSubmit}
              className="btn-primary"
              style={{ width: '100%', height: '54px', fontSize: '16px', borderRadius: '14px' }}
            >
              {language === 'ru' ? 'Продолжить' : 'Continuă'}
              <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Button>
          </>
        )}

        {/* Step 2: Phone */}
        {step === 'phone' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 30px -10px rgba(14, 165, 233, 0.5)'
              }}>
                <Phone size={36} color="white" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '10px', color: '#111' }}>
                {language === 'ru' ? 'Подтверждение номера' : 'Confirmare număr'}
              </h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5 }}>
                {language === 'ru' 
                  ? 'Мы отправим SMS с кодом подтверждения' 
                  : 'Vom trimite un SMS cu codul de confirmare'}
              </p>
            </div>

            {/* Show entered name */}
            <div style={{
              background: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <User size={20} color="#0ea5e9" />
              <span style={{ fontWeight: 600, color: '#333' }}>{firstName} {lastName}</span>
              <button 
                onClick={() => setStep('name')}
                style={{ 
                  marginLeft: 'auto', 
                  background: 'none', 
                  border: 'none', 
                  color: '#0ea5e9', 
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {language === 'ru' ? 'Изменить' : 'Modifică'}
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                {language === 'ru' ? 'Номер телефона' : 'Număr de telefon'}
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+373 XX XXX XXX"
                style={{ fontSize: '20px', padding: '16px', borderRadius: '12px', fontFamily: 'monospace' }}
              />
            </div>

            {/* reCAPTCHA container */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '54px', fontSize: '16px', borderRadius: '14px' }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  {language === 'ru' ? 'Получить код SMS' : 'Obține codul SMS'}
                  <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </>
              )}
            </Button>

            <button
              onClick={() => setStep('name')}
              style={{
                marginTop: '16px',
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

        {/* Step 3: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)'
              }}>
                <ShieldCheck size={36} color="white" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '10px', color: '#111' }}>
                {language === 'ru' ? 'Введите код' : 'Introduceți codul'}
              </h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5 }}>
                {language === 'ru' 
                  ? `SMS отправлен на номер ${phone}` 
                  : `SMS trimis la numărul ${phone}`}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                style={{ 
                  fontSize: '36px', 
                  textAlign: 'center', 
                  letterSpacing: '12px', 
                  padding: '20px',
                  borderRadius: '14px',
                  fontFamily: 'monospace'
                }}
                maxLength={6}
                autoFocus
              />
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="btn-primary"
              style={{ 
                width: '100%', 
                height: '54px', 
                fontSize: '16px', 
                borderRadius: '14px',
                background: otp.length === 6 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : undefined
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <ShieldCheck size={20} style={{ marginRight: '8px' }} />
                  {language === 'ru' ? 'Подтвердить и оформить' : 'Confirmă și plasează'}
                </>
              )}
            </Button>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginTop: '20px' 
            }}>
              <button
                onClick={handleResendOTP}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0ea5e9',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'ru' ? 'Отправить код повторно' : 'Retrimite codul'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

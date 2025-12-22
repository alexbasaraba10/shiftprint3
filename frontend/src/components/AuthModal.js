import React, { useState } from 'react';
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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
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

    setLoading(true);
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toast.success(language === 'ru' ? 'SMS код отправлен!' : 'Cod SMS trimis!');
    } catch (error) {
      console.error('OTP error:', error);
      toast.error(language === 'ru' ? 'Ошибка отправки SMS. Проверьте номер телефона.' : 'Eroare la trimiterea SMS. Verificați numărul.');
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
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
      toast.success(language === 'ru' ? '✅ Номер подтверждён! Добро пожаловать!' : '✅ Număr confirmat! Bine ați venit!');
      onSuccess(userData);
      onClose();
      
      // Reset form
      setStep('name');
      setPhone('+373');
      setOtp('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      console.error('Verify error:', error);
      toast.error(language === 'ru' ? 'Неверный код. Попробуйте ещё раз.' : 'Cod invalid. Încercați din nou.');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    // Reset recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    setOtp('');
    await handleSendOTP();
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
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <button
          onClick={onClose}
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

        <div id="recaptcha-container"></div>

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

            <div style={{ marginBottom: '24px' }}>
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
                onClick={() => setStep('phone')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'ru' ? '← Изменить номер' : '← Schimbă numărul'}
              </button>
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
                {language === 'ru' ? 'Отправить повторно' : 'Retrimite codul'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

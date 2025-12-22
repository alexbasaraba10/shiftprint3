import React, { useState } from 'react';
import { X, Phone, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState('phone'); // phone, otp, name
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
      toast.error(language === 'ru' ? 'Ошибка отправки SMS' : 'Eroare la trimiterea SMS');
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
      setStep('name');
    } catch (error) {
      console.error('Verify error:', error);
      toast.error(language === 'ru' ? 'Неверный код' : 'Cod invalid');
    }
    setLoading(false);
  };

  const handleComplete = () => {
    if (!firstName || !lastName) {
      toast.error(language === 'ru' ? 'Заполните имя и фамилию' : 'Completați numele și prenumele');
      return;
    }

    const userData = {
      phone,
      firstName,
      lastName,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(language === 'ru' ? 'Добро пожаловать!' : 'Bine ați venit!');
    onSuccess(userData);
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
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={24} color="#666" />
        </button>

        <div id="recaptcha-container"></div>

        {step === 'phone' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Phone size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ru' ? 'Вход в аккаунт' : 'Autentificare'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? 'Введите номер телефона для получения SMS-кода' : 'Introduceți numărul de telefon pentru a primi codul SMS'}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Label style={{ marginBottom: '8px', display: 'block' }}>
                {language === 'ru' ? 'Номер телефона' : 'Număr de telefon'}
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+373 XX XXX XXX"
                style={{ fontSize: '18px', padding: '14px' }}
              />
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '52px' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (language === 'ru' ? 'Получить код' : 'Obține codul')}
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ru' ? 'Введите код' : 'Introduceți codul'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? `SMS отправлен на ${phone}` : `SMS trimis la ${phone}`}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ fontSize: '32px', textAlign: 'center', letterSpacing: '8px', padding: '16px' }}
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '52px' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (language === 'ru' ? 'Подтвердить' : 'Confirmă')}
            </Button>

            <button
              onClick={() => setStep('phone')}
              style={{
                marginTop: '16px',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {language === 'ru' ? '← Изменить номер' : '← Schimbă numărul'}
            </button>
          </>
        )}

        {step === 'name' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <User size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ru' ? 'Почти готово!' : 'Aproape gata!'}
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {language === 'ru' ? 'Введите ваше имя и фамилию' : 'Introduceți numele și prenumele'}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label style={{ marginBottom: '8px', display: 'block' }}>
                {language === 'ru' ? 'Имя' : 'Prenume'}
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={language === 'ru' ? 'Иван' : 'Ion'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Label style={{ marginBottom: '8px', display: 'block' }}>
                {language === 'ru' ? 'Фамилия' : 'Nume'}
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={language === 'ru' ? 'Иванов' : 'Ionescu'}
              />
            </div>

            <Button
              onClick={handleComplete}
              className="btn-primary"
              style={{ width: '100%', height: '52px' }}
            >
              {language === 'ru' ? 'Завершить регистрацию' : 'Finalizează înregistrarea'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Percent, RefreshCw, User, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Profile = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadOrders();
  }, []);

  const loadUserData = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load discount from API for Google users
      if (parsedUser.email) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/discount/${encodeURIComponent(parsedUser.email)}`);
          if (response.ok) {
            const data = await response.json();
            setDiscount(data.discountPercent);
          }
        } catch (error) {
          console.error('Error loading discount:', error);
          // Fallback to local calculation
          const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          const completed = history.filter(o => o.status === 'completed').length;
          setDiscount(Math.min(completed * 5, 25));
        }
      } else {
        // For non-Google users, calculate locally
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const completed = history.filter(o => o.status === 'completed').length;
        setDiscount(Math.min(completed * 5, 25));
      }
    }
  };

  const loadOrders = async () => {
    const history = localStorage.getItem('orderHistory');
    if (history) {
      setOrders(JSON.parse(history));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success(language === 'ru' ? 'Вы вышли из аккаунта' : 'V-ați deconectat');
  };

  const handleRepeatOrder = (order) => {
    navigate('/calculator', { state: { repeatOrder: order } });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      const displayName = googleUser.displayName || '';
      const nameParts = displayName.split(' ');
      
      const userData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: googleUser.email || '',
        phone: localStorage.getItem('userPhone') || '',
        authMethod: 'google',
        googleId: googleUser.uid,
        photoURL: googleUser.photoURL,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userEmail', googleUser.email || '');
      setUser(userData);
      
      // Load discount for this user
      if (userData.email) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/discount/${encodeURIComponent(userData.email)}`);
          if (response.ok) {
            const data = await response.json();
            setDiscount(data.discountPercent);
          }
        } catch (e) {
          console.error('Error loading discount:', e);
        }
      }
      
      toast.success(language === 'ru' ? 'Вход выполнен успешно!' : 'Autentificare reușită!');
      loadOrders();
    } catch (error) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error(language === 'ru' 
          ? 'Домен не авторизован в Firebase' 
          : 'Domeniul nu este autorizat în Firebase');
      } else {
        toast.error(language === 'ru' ? 'Ошибка входа через Google' : 'Eroare autentificare Google');
      }
    }
    setGoogleLoading(false);
  };

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token || 'admin');
        localStorage.setItem('adminEmail', adminEmail);
        toast.success(language === 'ru' ? 'Вход выполнен!' : 'Autentificare reușită!');
        navigate('/admin');
      } else {
        toast.error(language === 'ru' ? 'Неверный email или пароль' : 'Email sau parolă incorecte');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(language === 'ru' ? 'Ошибка соединения' : 'Eroare de conexiune');
    }
    setAdminLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'printing': return { bg: '#dbeafe', text: '#1e40af', icon: '🖨️' };
      case 'pending_payment': return { bg: '#fef3c7', text: '#92400e', icon: '💳' };
      case 'ready': return { bg: '#d1fae5', text: '#065f46', icon: '✅' };
      case 'completed': return { bg: '#e0e7ff', text: '#4338ca', icon: '📦' };
      case 'approved': return { bg: '#d1fae5', text: '#065f46', icon: '✅' };
      default: return { bg: '#f3f4f6', text: '#374151', icon: '⏳' };
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      ru: {
        printing: 'В печати',
        pending_payment: 'Ожидание оплаты',
        ready: 'Готов к выдаче',
        completed: 'Завершён',
        pending: 'В обработке',
        approved: 'Подтверждён'
      },
      ro: {
        printing: 'În printare',
        pending_payment: 'Așteptare plată',
        ready: 'Gata pentru ridicare',
        completed: 'Finalizat',
        pending: 'În procesare',
        approved: 'Confirmat'
      }
    };
    return statuses[language][status] || statuses[language].pending;
  };

  // Not logged in view
  if (!user) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <User size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
            {language === 'ru' ? 'Личный кабинет' : 'Cont personal'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '16px' }}>
            {language === 'ru' 
              ? 'Войдите через аккаунт Google'
              : 'Conectați-vă prin contul Google'}
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            {language === 'ru' 
              ? 'Для отслеживания заказов, получения скидок и персональных предложений'
              : 'Pentru urmărirea comenzilor, reduceri și oferte personale'}
          </p>
          <Button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-primary"
            style={{ width: '100%', height: '56px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          >
            {googleLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {language === 'ru' ? 'Войти через Google' : 'Conectare cu Google'}
          </Button>

          {/* Admin Login Section */}
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)' }}>
            {!showAdminLogin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <Shield size={16} />
                {language === 'ru' ? 'Администратор' : 'Administrator'}
              </button>
            ) : (
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="var(--brand-primary)" />
                  {language === 'ru' ? 'Вход для администратора' : 'Autentificare administrator'}
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    style={{ marginBottom: '12px' }}
                  />
                  <Input
                    type="password"
                    placeholder={language === 'ru' ? 'Пароль' : 'Parolă'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    onClick={handleAdminLogin}
                    disabled={adminLoading}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {adminLoading ? <Loader2 className="animate-spin" size={18} /> : (language === 'ru' ? 'Войти' : 'Intră')}
                  </Button>
                  <Button
                    onClick={() => setShowAdminLogin(false)}
                    className="btn-secondary"
                  >
                    {language === 'ru' ? 'Отмена' : 'Anulare'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        {/* User Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
          padding: '40px',
          borderRadius: '20px',
          marginBottom: '32px',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
              {user.firstName} {user.lastName}
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} />
              {user.phone}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}
          >
            <LogOut size={18} />
            {language === 'ru' ? 'Выйти' : 'Ieși'}
          </Button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--brand-hover)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={20} color="var(--brand-primary)" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {language === 'ru' ? 'Всего заказов' : 'Total comenzi'}
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--brand-primary)' }}>
              {orders.length}
            </div>
          </div>

          <div style={{
            background: discount > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '16px',
            border: discount > 0 ? 'none' : '1px solid var(--border-subtle)',
            color: discount > 0 ? 'white' : 'inherit'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: discount > 0 ? 'rgba(255,255,255,0.2)' : 'var(--brand-hover)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Percent size={20} color={discount > 0 ? 'white' : 'var(--brand-primary)'} />
              </div>
              <span style={{ fontSize: '14px', opacity: discount > 0 ? 0.9 : 1, color: discount > 0 ? 'white' : 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Ваша скидка' : 'Reducerea dvs.'}
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>
              {discount}%
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
            📋 {language === 'ru' ? 'История заказов' : 'Istoric comenzi'}
          </h2>
          
          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Package size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {language === 'ru' ? 'У вас пока нет заказов' : 'Nu aveți încă comenzi'}
              </p>
              <Button onClick={() => navigate('/calculator')} className="btn-primary">
                {language === 'ru' ? 'Создать первый заказ' : 'Creează prima comandă'}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                return (
                  <div key={order.id} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '12px'
                      }}>
                        {statusStyle.icon} {getStatusText(order.status)}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                        📄 {order.fileName}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span>🎨 {order.materialName}</span>
                        <span>⚙️ {order.infill}</span>
                      </div>
                    </div>
                    <Button onClick={() => handleRepeatOrder(order)} className="btn-secondary">
                      <RefreshCw size={16} />
                      {language === 'ru' ? 'Повторить' : 'Repetă'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

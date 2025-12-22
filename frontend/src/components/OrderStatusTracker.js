import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OrderStatusTracker = () => {
  const { language } = useLanguage();
  const [orderStatus, setOrderStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Check for pending order
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      setOrderId(pendingOrderId);
      checkOrderStatus(pendingOrderId);
      
      // Poll for status updates every 10 seconds
      const interval = setInterval(() => {
        checkOrderStatus(pendingOrderId);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const checkOrderStatus = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${id}/status`);
      if (response.ok) {
        const data = await response.json();
        setOrderStatus(data);
        
        // Show notification if status changed
        if (data.status === 'approved' || data.status === 'price_changed' || data.status === 'completed') {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Clear from localStorage if completed
    if (orderStatus?.status === 'completed') {
      localStorage.removeItem('pendingOrderId');
    }
  };

  const getStatusInfo = () => {
    if (!orderStatus) return null;
    
    switch (orderStatus.status) {
      case 'approved':
        return {
          icon: <CheckCircle size={28} color="#22c55e" />,
          title: language === 'ru' ? 'Заказ подтверждён!' : 'Comandă confirmată!',
          message: language === 'ru' 
            ? `Ваш заказ "${orderStatus.fileName}" был подтверждён оператором.`
            : `Comanda dvs. "${orderStatus.fileName}" a fost confirmată de operator.`,
          color: '#22c55e',
          bgColor: 'rgba(34, 197, 94, 0.1)'
        };
      case 'price_changed':
        return {
          icon: <AlertCircle size={28} color="#f59e0b" />,
          title: language === 'ru' ? 'Цена изменена!' : 'Preț modificat!',
          message: language === 'ru' 
            ? `Цена вашего заказа "${orderStatus.fileName}" была изменена на ${orderStatus.finalCost} MDL.`
            : `Prețul comenzii dvs. "${orderStatus.fileName}" a fost modificat la ${orderStatus.finalCost} MDL.`,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          price: orderStatus.finalCost
        };
      case 'completed':
        return {
          icon: <Package size={28} color="#8b5cf6" />,
          title: language === 'ru' ? 'Заказ готов!' : 'Comandă gata!',
          message: language === 'ru' 
            ? `Ваш заказ "${orderStatus.fileName}" готов к выдаче!`
            : `Comanda dvs. "${orderStatus.fileName}" este gata pentru ridicare!`,
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)'
        };
      case 'pending':
      default:
        return {
          icon: <Clock size={28} color="#0ea5e9" />,
          title: language === 'ru' ? 'Заказ обрабатывается' : 'Comandă în procesare',
          message: language === 'ru' 
            ? `Ваш заказ "${orderStatus.fileName}" ожидает подтверждения оператора.`
            : `Comanda dvs. "${orderStatus.fileName}" așteaptă confirmarea operatorului.`,
          color: '#0ea5e9',
          bgColor: 'rgba(14, 165, 233, 0.1)'
        };
    }
  };

  if (!isVisible || !orderStatus) return null;

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      width: '360px',
      maxWidth: 'calc(100vw - 40px)',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.25)',
      zIndex: 9999,
      overflow: 'hidden',
      animation: 'slideIn 0.3s ease'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{
        background: statusInfo.bgColor,
        padding: '20px',
        borderBottom: `2px solid ${statusInfo.color}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {statusInfo.icon}
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>
              {statusInfo.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} color="#666" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px' }}>
        <p style={{ margin: '0 0 16px 0', color: '#444', lineHeight: 1.5 }}>
          {statusInfo.message}
        </p>
        
        {statusInfo.price && (
          <div style={{
            background: statusInfo.bgColor,
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              {language === 'ru' ? 'Новая цена:' : 'Preț nou:'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: statusInfo.color }}>
              {statusInfo.price} MDL
            </div>
          </div>
        )}
        
        {orderStatus.status === 'completed' && (
          <div style={{
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              📍 {language === 'ru' ? 'Адрес выдачи:' : 'Adresa de ridicare:'}
            </div>
            <div style={{ fontWeight: 600, color: '#111' }}>
              г. Кишинёв, ул. Примэрией 45
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          fontSize: '12px',
          color: '#999'
        }}>
          <span>#{orderId?.slice(-8)}</span>
          <span>•</span>
          <span>{orderStatus.fileName}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracker;

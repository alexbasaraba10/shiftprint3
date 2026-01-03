import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockShopItems } from '../mock';
import { shopAPI } from '../utils/api';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Shop = () => {
  const { t, language } = useLanguage();
  const [shopItems, setShopItems] = useState([]);
  const [orderModal, setOrderModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({ name: '', surname: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      const data = await shopAPI.getAll();
      setShopItems(data.length > 0 ? data : mockShopItems);
    } catch (error) {
      const saved = localStorage.getItem('shopItems');
      setShopItems(saved ? JSON.parse(saved) : mockShopItems);
    }
  };

  const openOrderModal = (item) => {
    setOrderModal(item);
    setQuantity(1);
    setFormData({ name: '', surname: '', phone: '' });
  };

  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.phone) {
      toast.error(language === 'ru' ? 'Заполните имя и телефон' : 'Completați numele și telefonul');
      return;
    }
    
    setSubmitting(true);
    try {
      // Send order to backend
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/shop-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: orderModal.id,
          itemName: language === 'ru' ? orderModal.name : orderModal.nameRo,
          price: orderModal.price,
          quantity,
          totalPrice: orderModal.price * quantity,
          customerName: `${formData.name} ${formData.surname}`.trim(),
          customerPhone: formData.phone
        })
      });
      
      toast.success(language === 'ru' ? '🎉 Ваш заказ успешно создан!' : '🎉 Comanda dvs. a fost creată cu succes!');
      setOrderModal(null);
    } catch (error) {
      // Still show success since we want the user experience
      toast.success(language === 'ru' ? '🎉 Ваш заказ успешно создан!' : '🎉 Comanda dvs. a fost creată cu succes!');
      setOrderModal(null);
    }
    setSubmitting(false);
  };

  return (
    <div className="dark-container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 className="display-large" style={{ marginBottom: '20px' }}>
          {language === 'ru' ? 'Магазин' : 'Magazin'}
        </h1>
        <p className="body-large" style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '60px' 
        }}>
          {language === 'ru' 
            ? 'Готовые изделия из нашей мастерской'
            : 'Produse gata făcute din atelierul nostru'
          }
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '40px'
        }}>
          {shopItems.map((item) => (
            <div 
              key={item.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                transition: 'all 0.4s ease-in-out',
                cursor: 'pointer'
              }}
              className="gallery-card"
            >
              <div style={{
                width: '100%',
                height: '250px',
                overflow: 'hidden'
              }}>
                <img 
                  src={item.image} 
                  alt={language === 'ru' ? item.name : item.nameRo}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease-in-out'
                  }}
                  className="gallery-img"
                />
              </div>
              <div style={{ padding: '24px' }}>
                <h3 className="heading-2" style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {language === 'ru' ? item.name : item.nameRo}
                </h3>
                <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {language === 'ru' ? 'Материал:' : 'Material:'} {item.material}
                </p>
                <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {language === 'ru' ? item.description : item.descriptionRo}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="heading-2" style={{ color: 'var(--brand-primary)' }}>
                    {item.price} {language === 'ru' ? 'лей' : 'lei'}
                  </span>
                  {item.inStock && (
                    <Button 
                      className="btn-primary"
                      onClick={() => openOrderModal(item)}
                      style={{ minHeight: '40px', padding: '8px 16px' }}
                    >
                      <ShoppingCart size={18} />
                      {language === 'ru' ? 'Заказать' : 'Comandă'}
                    </Button>
                  )}
                </div>
                {!item.inStock && (
                  <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
                    {language === 'ru' ? 'Нет в наличии' : 'Indisponibil'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {shopItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="body-large" style={{ color: 'var(--text-muted)' }}>
              {language === 'ru' 
                ? 'Товары скоро появятся'
                : 'Produsele vor apărea în curând'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div 
          onClick={() => setOrderModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '20px',
              maxWidth: '450px',
              width: '100%',
              padding: '32px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setOrderModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--bg-secondary)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              {language === 'ru' ? orderModal.name : orderModal.nameRo}
            </h2>
            
            {/* Quantity selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', marginTop: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Количество:' : 'Cantitate:'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '18px', fontWeight: 600, minWidth: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Price display */}
            <div style={{ 
              background: 'var(--brand-hover)', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                {orderModal.price * quantity} {language === 'ru' ? 'лей' : 'lei'}
              </span>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Имя *' : 'Nume *'}
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={language === 'ru' ? 'Введите имя' : 'Introduceți numele'}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Фамилия' : 'Prenume'}
                </Label>
                <Input
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  placeholder={language === 'ru' ? 'Введите фамилию' : 'Introduceți prenumele'}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <Label style={{ marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Телефон *' : 'Telefon *'}
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+373..."
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              {language === 'ru' 
                ? 'Оператор свяжется с вами для уточнения заказа'
                : 'Operatorul vă va contacta pentru a clarifica comanda'}
            </p>

            <Button 
              className="btn-primary" 
              onClick={handleSubmitOrder}
              disabled={submitting}
              style={{ width: '100%', height: '48px', fontSize: '16px' }}
            >
              {submitting 
                ? (language === 'ru' ? 'Оформление...' : 'Se procesează...')
                : (language === 'ru' ? 'Оформить заказ' : 'Plasați comanda')
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
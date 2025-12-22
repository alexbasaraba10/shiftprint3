import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockShopItems } from '../mock';
import { shopAPI } from '../utils/api';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const Shop = () => {
  const { t, language } = useLanguage();
  const [shopItems, setShopItems] = useState([]);

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

  const handleContact = (itemName) => {
    toast.success(
      language === 'ru'
        ? `Отлично! Свяжитесь с нами для заказа: ${itemName}`
        : `Perfect! Contactați-ne pentru a comanda: ${itemName}`
    );
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
                      onClick={() => handleContact(language === 'ru' ? item.name : item.nameRo)}
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
    </div>
  );
};

export default Shop;
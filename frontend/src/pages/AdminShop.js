import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { shopAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const AdminShop = () => {
  const { language } = useLanguage();
  const [shopItems, setShopItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameRo: '',
    price: '',
    material: '',
    image: '',
    description: '',
    descriptionRo: '',
    inStock: true
  });

  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      const data = await shopAPI.getAll();
      setShopItems(data);
    } catch (error) {
      const saved = localStorage.getItem('shopItems');
      setShopItems(saved ? JSON.parse(saved) : []);
    }
  };

  const handleAddOrEdit = async () => {
    if (!formData.name || !formData.price || !formData.material) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Completați câmpurile obligatorii');
      return;
    }

    try {
      const itemData = { ...formData, price: parseFloat(formData.price) };
      
      if (isEditing && editingItem) {
        await shopAPI.update(editingItem.id, itemData);
        toast.success(language === 'ru' ? 'Товар обновлен' : 'Produs actualizat');
      } else {
        await shopAPI.create(itemData);
        toast.success(language === 'ru' ? 'Товар добавлен' : 'Produs adăugat');
      }

      loadShopItems();
      resetForm();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при сохранении' : 'Eroare la salvare');
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      nameRo: item.nameRo,
      price: item.price.toString(),
      material: item.material,
      image: item.image,
      description: item.description,
      descriptionRo: item.descriptionRo,
      inStock: item.inStock
    });
  };

  const handleDelete = async (id) => {
    try {
      await shopAPI.delete(id);
      toast.success(language === 'ru' ? 'Товар удален' : 'Produs șters');
      loadShopItems();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при удалении' : 'Eroare la ștergere');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setFormData({
      name: '',
      nameRo: '',
      price: '',
      material: '',
      image: '',
      description: '',
      descriptionRo: '',
      inStock: true
    });
  };

  return (
    <div>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        padding: '40px',
        marginBottom: '40px'
      }}>
        <h2 className="heading-1" style={{ marginBottom: '24px' }}>
          {isEditing 
            ? (language === 'ru' ? 'Редактировать товар' : 'Editează produsul')
            : (language === 'ru' ? 'Добавить товар' : 'Adaugă produs')
          }
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label className="body-medium">{language === 'ru' ? 'Название (RU)' : 'Nume (RU)'}</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
            <div>
              <Label className="body-medium">{language === 'ru' ? 'Название (RO)' : 'Nume (RO)'}</Label>
              <Input 
                value={formData.nameRo}
                onChange={(e) => setFormData({...formData, nameRo: e.target.value})}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label className="body-medium">{language === 'ru' ? 'Цена (лей)' : 'Preț (lei)'}</Label>
              <Input 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
            <div>
              <Label className="body-medium">{language === 'ru' ? 'Материал' : 'Material'}</Label>
              <Input 
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
          </div>
          <div>
            <Label className="body-medium">{language === 'ru' ? 'URL изображения' : 'URL imagine'}</Label>
            <Input 
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
            />
          </div>
          <div>
            <Label className="body-medium">{language === 'ru' ? 'Описание (RU)' : 'Descriere (RU)'}</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
            />
          </div>
          <div>
            <Label className="body-medium">{language === 'ru' ? 'Описание (RO)' : 'Descriere (RO)'}</Label>
            <Textarea 
              value={formData.descriptionRo}
              onChange={(e) => setFormData({...formData, descriptionRo: e.target.value})}
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <Label className="body-medium">{language === 'ru' ? 'В наличии' : 'În stoc'}</Label>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button className="btn-primary" onClick={handleAddOrEdit}>
              {isEditing 
                ? (language === 'ru' ? 'Сохранить изменения' : 'Salvează modificările')
                : (language === 'ru' ? 'Добавить товар' : 'Adaugă produs')
              }
            </Button>
            {isEditing && (
              <Button className="btn-secondary" onClick={resetForm}>
                {language === 'ru' ? 'Отменить' : 'Anulează'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <h2 className="heading-1" style={{ marginBottom: '24px' }}>
        {language === 'ru' ? 'Товары в магазине' : 'Produse în magazin'}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {shopItems.map((item) => (
          <div 
            key={item.id}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              )}
              <div>
                <h3 className="heading-2">{item.name}</h3>
                <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                  {item.price} {language === 'ru' ? 'лей' : 'lei'} • {item.material}
                </p>
                <p className="body-small" style={{ color: item.inStock ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                  {item.inStock 
                    ? (language === 'ru' ? 'В наличии' : 'În stoc')
                    : (language === 'ru' ? 'Нет в наличии' : 'Indisponibil')
                  }
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                className="btn-secondary"
                onClick={() => handleEdit(item)}
                style={{ minHeight: '40px', padding: '8px 16px' }}
              >
                <Edit size={18} />
              </Button>
              <Button 
                className="btn-primary"
                onClick={() => handleDelete(item.id)}
                style={{ minHeight: '40px', padding: '8px 16px', background: 'var(--brand-primary)' }}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminShop;
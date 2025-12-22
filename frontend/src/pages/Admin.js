import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockMaterials, mockOrders, mockGalleryItems } from '../mock';
import { materialsAPI, galleryAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Edit } from 'lucide-react';
import AdminShop from './AdminShop';
import ColorPicker from '../components/ColorPicker';
import ImageUpload from '../components/ImageUpload';

const Admin = () => {
  const { t, language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if already logged in via localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Materials state
  const [materials, setMaterials] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: '', nameRo: '', colors: [], type: '', price: '', description: '', descriptionRo: ''
  });

  // Gallery state
  const [galleryItems, setGalleryItems] = useState([]);
  const [editingGallery, setEditingGallery] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '', titleRo: '', image: '', material: '', description: ''
  });

  // Orders & Settings
  const [orders, setOrders] = useState(mockOrders);
  const [printSettings, setPrintSettings] = useState({ 
    electricityCost: 2.5, 
    printerPower: 0.3, 
    markup: 30, 
    laborCost: 50 
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadMaterials();
      loadGallery();
      loadPrintSettings();
    }
  }, [isLoggedIn]);

  const loadPrintSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/print-settings`);
      if (response.ok) {
        const data = await response.json();
        setPrintSettings({
          electricityCost: data.electricityCost,
          printerPower: data.printerPower,
          markup: data.markup,
          laborCost: data.laborCost
        });
      }
    } catch (error) {
      console.error('Error loading print settings:', error);
    }
  };

  const handleSavePrintSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/print-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printSettings)
      });

      if (response.ok) {
        toast.success(language === 'ru' ? 'Настройки сохранены' : 'Setări salvate');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка сохранения' : 'Eroare la salvare');
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await materialsAPI.getAll();
      setMaterials(data.length > 0 ? data : mockMaterials);
    } catch (error) {
      const saved = localStorage.getItem('materials');
      setMaterials(saved ? JSON.parse(saved) : mockMaterials);
    }
  };

  const loadGallery = async () => {
    try {
      const data = await galleryAPI.getAll();
      setGalleryItems(data.length > 0 ? data : mockGalleryItems);
    } catch (error) {
      const saved = localStorage.getItem('gallery');
      setGalleryItems(saved ? JSON.parse(saved) : mockGalleryItems);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(language === 'ru' ? 'Введите email и пароль' : 'Introduceți email și parola');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.email);
        setIsLoggedIn(true);
        toast.success(language === 'ru' ? 'Вход выполнен' : 'Autentificat cu succes');
      } else {
        toast.error(language === 'ru' ? 'Неверный email или пароль' : 'Email sau parolă greșită');
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка входа' : 'Eroare de autentificare');
    }
  };

  // Material CRUD
  const handleAddOrEditMaterial = async () => {
    if (!materialForm.name || !materialForm.price) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Completați câmpurile obligatorii');
      return;
    }

    try {
      const materialData = { ...materialForm, price: parseFloat(materialForm.price) };
      
      if (editingMaterial) {
        await materialsAPI.update(editingMaterial.id, materialData);
        toast.success(language === 'ru' ? 'Материал обновлен' : 'Material actualizat');
      } else {
        await materialsAPI.create(materialData);
        toast.success(language === 'ru' ? 'Материал добавлен' : 'Material adăugat');
      }
      
      loadMaterials();
      resetMaterialForm();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при сохранении' : 'Eroare la salvare');
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      ...material,
      colors: material.colors || []
    });
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await materialsAPI.delete(id);
      toast.success(language === 'ru' ? 'Материал удален' : 'Material șters');
      loadMaterials();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при удалении' : 'Eroare la ștergere');
    }
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', nameRo: '', color: '', colorRo: '', type: '', price: '', description: '', descriptionRo: '' });
  };

  // Gallery CRUD
  const handleAddOrEditGallery = async () => {
    if (!galleryForm.title || !galleryForm.image) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Completați câmpurile obligatorii');
      return;
    }

    try {
      if (editingGallery) {
        await galleryAPI.update(editingGallery.id, galleryForm);
        toast.success(language === 'ru' ? 'Работа обновлена' : 'Lucrare actualizată');
      } else {
        await galleryAPI.create(galleryForm);
        toast.success(language === 'ru' ? 'Работа добавлена' : 'Lucrare adăugată');
      }
      
      loadGallery();
      resetGalleryForm();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при сохранении' : 'Eroare la salvare');
    }
  };

  const handleEditGallery = (item) => {
    setEditingGallery(item);
    setGalleryForm(item);
  };

  const handleDeleteGallery = async (id) => {
    try {
      await galleryAPI.delete(id);
      toast.success(language === 'ru' ? 'Работа удалена' : 'Lucrare ștearsă');
      loadGallery();
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при удалении' : 'Eroare la ștergere');
    }
  };

  const resetGalleryForm = () => {
    setEditingGallery(null);
    setGalleryForm({ title: '', titleRo: '', image: '', material: '', description: '' });
  };

  const handleApproveOrder = (orderId) => {
    toast.success(language === 'ru' ? `Заказ #${orderId} подтвержден` : `Comanda #${orderId} confirmată`);
  };

  if (!isLoggedIn) {
    return (
      <div className="dark-container" style={{ 
        paddingTop: '140px', 
        paddingBottom: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '60px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 className="display-medium" style={{ marginBottom: '40px', textAlign: 'center' }}>
            {t('admin.login')}
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <Label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                {t('admin.email')}
              </Label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <Label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>
                {t('admin.password')}
              </Label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              />
            </div>
            <Button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {t('admin.loginButton')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="display-large" style={{ marginBottom: '60px' }}>
          {t('nav.admin')}
        </h1>

        <Tabs defaultValue="materials" style={{ width: '100%' }}>
          <TabsList style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)',
            padding: '4px',
            marginBottom: '40px',
            display: 'flex',
            flexWrap: 'wrap'
          }}>
            <TabsTrigger value="materials">{t('admin.materials.title')}</TabsTrigger>
            <TabsTrigger value="gallery">{language === 'ru' ? 'Галерея' : 'Galerie'}</TabsTrigger>
            <TabsTrigger value="shop">{language === 'ru' ? 'Магазин' : 'Magazin'}</TabsTrigger>
            <TabsTrigger value="settings">{t('admin.settings.title')}</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="heading-1" style={{ marginBottom: '24px' }}>{t('admin.orders.pending')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => (
                <div key={order.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '24px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <p className="body-medium">{t('admin.orders.file')}: <span style={{ color: 'var(--text-primary)' }}>{order.fileName}</span></p>
                    <p className="body-medium">{t('admin.orders.material')}: <span style={{ color: 'var(--text-primary)' }}>{order.material}</span></p>
                    <p className="body-medium">{language === 'ru' ? 'Вес' : 'Greutate'}: <span style={{ color: 'var(--text-primary)' }}>{order.weight}g</span></p>
                    <p className="body-medium">{language === 'ru' ? 'Время' : 'Timp'}: <span style={{ color: 'var(--text-primary)' }}>{order.printTime}</span></p>
                    <p className="heading-2" style={{ color: 'var(--brand-primary)', marginTop: '8px' }}>
                      {t('admin.orders.cost')}: {order.calculatedCost} {language === 'ru' ? 'лей' : 'lei'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button className="btn-primary" onClick={() => handleApproveOrder(order.id)}>{t('admin.orders.approve')}</Button>
                    <Button className="btn-secondary">{t('admin.orders.edit')}</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '40px',
              marginBottom: '40px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '24px' }}>
                {editingMaterial ? (language === 'ru' ? 'Редактировать материал' : 'Editează materialul') : t('admin.materials.add')}
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <Label>{t('admin.materials.name')} (RU)</Label>
                    <Input value={materialForm.name} onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})} 
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                  </div>
                  <div>
                    <Label>{t('admin.materials.name')} (RO)</Label>
                    <Input value={materialForm.nameRo} onChange={(e) => setMaterialForm({...materialForm, nameRo: e.target.value})} 
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                  </div>
                </div>
                <div>
                  <ColorPicker
                    selectedColors={materialForm.colors || []}
                    onChange={(colors) => setMaterialForm({...materialForm, colors})}
                    label={language === 'ru' ? 'Доступные цвета' : 'Culori disponibile'}
                  />
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Тип' : 'Tip'}</Label>
                  <Input value={materialForm.type} onChange={(e) => setMaterialForm({...materialForm, type: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div>
                  <Label>{t('admin.materials.price')}</Label>
                  <Input type="number" value={materialForm.price} onChange={(e) => setMaterialForm({...materialForm, price: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div>
                  <Label>{t('admin.materials.desc')} (RU)</Label>
                  <Textarea value={materialForm.description} onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div>
                  <Label>{t('admin.materials.desc')} (RO)</Label>
                  <Textarea value={materialForm.descriptionRo} onChange={(e) => setMaterialForm({...materialForm, descriptionRo: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button className="btn-primary" onClick={handleAddOrEditMaterial}>
                    {editingMaterial ? (language === 'ru' ? 'Сохранить изменения' : 'Salvează modificările') : t('admin.materials.add')}
                  </Button>
                  {editingMaterial && (
                    <Button className="btn-secondary" onClick={resetMaterialForm}>
                      {language === 'ru' ? 'Отменить' : 'Anulează'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <h2 className="heading-1" style={{ marginBottom: '24px' }}>{t('admin.materials.title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {materials.map((material) => (
                <div key={material.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 className="heading-2">{material.name}</h3>
                    <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                      {material.price} {language === 'ru' ? 'лей/кг' : 'lei/kg'} • {material.type}
                    </p>
                    {material.colors && material.colors.length > 0 && (
                      <p className="body-small" style={{ color: 'var(--brand-primary)', marginTop: '4px' }}>
                        Цвета: {material.colors.join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button className="btn-secondary" onClick={() => handleEditMaterial(material)} style={{ minHeight: '40px', padding: '8px 16px' }}>
                      <Edit size={18} />
                    </Button>
                    <Button className="btn-primary" onClick={() => handleDeleteMaterial(material.id)} 
                      style={{ minHeight: '40px', padding: '8px 16px', background: 'var(--brand-primary)' }}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '40px',
              marginBottom: '40px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '24px' }}>
                {editingGallery ? (language === 'ru' ? 'Редактировать работу' : 'Editează lucrarea') : (language === 'ru' ? 'Добавить работу' : 'Adaugă lucrare')}
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <Label>{language === 'ru' ? 'Название (RU)' : 'Titlu (RU)'}</Label>
                    <Input value={galleryForm.title} onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})} 
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                  </div>
                  <div>
                    <Label>{language === 'ru' ? 'Название (RO)' : 'Titlu (RO)'}</Label>
                    <Input value={galleryForm.titleRo} onChange={(e) => setGalleryForm({...galleryForm, titleRo: e.target.value})} 
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                  </div>
                </div>
                <div>
                  <ImageUpload 
                    value={galleryForm.image}
                    onChange={(img) => setGalleryForm({...galleryForm, image: img})}
                    label={language === 'ru' ? 'Изображение работы' : 'Imagine lucrare'}
                  />
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Материал' : 'Material'}</Label>
                  <Input value={galleryForm.material} onChange={(e) => setGalleryForm({...galleryForm, material: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Описание' : 'Descriere'}</Label>
                  <Textarea value={galleryForm.description} onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button className="btn-primary" onClick={handleAddOrEditGallery}>
                    {editingGallery ? (language === 'ru' ? 'Сохранить изменения' : 'Salvează modificările') : (language === 'ru' ? 'Добавить работу' : 'Adaugă lucrare')}
                  </Button>
                  {editingGallery && (
                    <Button className="btn-secondary" onClick={resetGalleryForm}>
                      {language === 'ru' ? 'Отменить' : 'Anulează'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <h2 className="heading-1" style={{ marginBottom: '24px' }}>{language === 'ru' ? 'Работы в галерее' : 'Lucrări în galerie'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {galleryItems.map((item) => (
                <div key={item.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden'
                }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px' }}>
                    <h3 className="heading-3">{item.title}</h3>
                    <p className="body-small" style={{ color: 'var(--text-muted)' }}>{item.material}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Button className="btn-secondary" onClick={() => handleEditGallery(item)} style={{ flex: 1, minHeight: '36px', padding: '6px 12px' }}>
                        <Edit size={16} />
                      </Button>
                      <Button className="btn-primary" onClick={() => handleDeleteGallery(item.id)} 
                        style={{ flex: 1, minHeight: '36px', padding: '6px 12px', background: 'var(--brand-primary)' }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <AdminShop />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '40px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '24px' }}>
                {language === 'ru' ? 'Настройки Печати' : 'Setări Printare'}
              </h2>
              <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                {language === 'ru' 
                  ? 'Эти параметры используются для автоматического расчёта стоимости печати' 
                  : 'Acești parametri sunt utilizați pentru calculul automat al prețului de printare'}
              </p>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <Label>{language === 'ru' ? 'Стоимость электричества (Lei за кВт·ч)' : 'Costul electricității (Lei pe kWh)'}</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={printSettings.electricityCost} 
                    onChange={(e) => setPrintSettings({...printSettings, electricityCost: parseFloat(e.target.value)})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} 
                  />
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Мощность принтера (кВт)' : 'Puterea imprimantei (kW)'}</Label>
                  <Input 
                    type="number" 
                    step="0.05" 
                    value={printSettings.printerPower} 
                    onChange={(e) => setPrintSettings({...printSettings, printerPower: parseFloat(e.target.value)})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} 
                  />
                  <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    {language === 'ru' ? '(Например: 0.3 кВт = 300 Ватт)' : '(De exemplu: 0.3 kW = 300 Wați)'}
                  </p>
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Стоимость работы (Lei в час)' : 'Costul muncii (Lei pe oră)'}</Label>
                  <Input 
                    type="number" 
                    value={printSettings.laborCost} 
                    onChange={(e) => setPrintSettings({...printSettings, laborCost: parseFloat(e.target.value)})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} 
                  />
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Наценка (%)' : 'Adaos (%)'}</Label>
                  <Input 
                    type="number" 
                    step="1" 
                    value={printSettings.markup} 
                    onChange={(e) => setPrintSettings({...printSettings, markup: parseFloat(e.target.value)})} 
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }} 
                  />
                  <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    {language === 'ru' ? '(Процент наценки на итоговую стоимость)' : '(Procent de adaos la prețul final)'}
                  </p>
                </div>
                <Button className="btn-primary" onClick={handleSavePrintSettings}>
                  {language === 'ru' ? 'Сохранить настройки' : 'Salvează setările'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

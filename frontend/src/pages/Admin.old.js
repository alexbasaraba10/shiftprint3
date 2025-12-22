import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockMaterials, mockOrders } from '../mock';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const Admin = () => {
  const { t, language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [materials, setMaterials] = useState(mockMaterials);
  const [orders, setOrders] = useState(mockOrders);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    color: '',
    price: '',
    description: ''
  });
  const [settings, setSettings] = useState({
    electricity: 2.5,
    postProcessing: 50,
    markup: 3
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login
    if (email && password) {
      setIsLoggedIn(true);
      toast.success(language === 'ru' ? 'Вход выполнен' : 'Autentificat cu succes');
    } else {
      toast.error(language === 'ru' ? 'Введите email и пароль' : 'Introduceți email și parola');
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.price) {
      setMaterials([...materials, { id: materials.length + 1, ...newMaterial, price: parseFloat(newMaterial.price) }]);
      setNewMaterial({ name: '', color: '', price: '', description: '' });
      toast.success(language === 'ru' ? 'Материал добавлен' : 'Material adăugat');
    }
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

        <Tabs defaultValue="orders" style={{ width: '100%' }}>
          <TabsList style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)',
            padding: '4px',
            marginBottom: '40px'
          }}>
            <TabsTrigger value="orders" style={{ color: 'var(--text-primary)' }}>
              {t('admin.orders.title')}
            </TabsTrigger>
            <TabsTrigger value="materials" style={{ color: 'var(--text-primary)' }}>
              {t('admin.materials.title')}
            </TabsTrigger>
            <TabsTrigger value="settings" style={{ color: 'var(--text-primary)' }}>
              {t('admin.settings.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <h2 className="heading-1" style={{ marginBottom: '24px' }}>
              {t('admin.orders.pending')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => (
                <div 
                  key={order.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '24px'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                      {t('admin.orders.file')}: <span style={{ color: 'var(--text-primary)' }}>{order.fileName}</span>
                    </p>
                    <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                      {t('admin.orders.material')}: <span style={{ color: 'var(--text-primary)' }}>{order.material}</span>
                    </p>
                    <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                      {language === 'ru' ? 'Вес' : 'Greutate'}: <span style={{ color: 'var(--text-primary)' }}>{order.weight}g</span>
                    </p>
                    <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                      {language === 'ru' ? 'Время' : 'Timp'}: <span style={{ color: 'var(--text-primary)' }}>{order.printTime}</span>
                    </p>
                    <p className="heading-2" style={{ color: 'var(--brand-primary)', marginTop: '8px' }}>
                      {t('admin.orders.cost')}: {order.calculatedCost} {language === 'ru' ? 'лей' : 'lei'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                      className="btn-primary"
                      onClick={() => handleApproveOrder(order.id)}
                    >
                      {t('admin.orders.approve')}
                    </Button>
                    <Button className="btn-secondary">
                      {t('admin.orders.edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '40px',
              marginBottom: '40px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '24px' }}>
                {t('admin.materials.add')}
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <Label className="body-medium">{t('admin.materials.name')}</Label>
                  <Input 
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <Label className="body-medium">{t('admin.materials.color')}</Label>
                  <Input 
                    value={newMaterial.color}
                    onChange={(e) => setNewMaterial({...newMaterial, color: e.target.value})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <Label className="body-medium">{t('admin.materials.price')}</Label>
                  <Input 
                    type="number"
                    value={newMaterial.price}
                    onChange={(e) => setNewMaterial({...newMaterial, price: e.target.value})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <Label className="body-medium">{t('admin.materials.desc')}</Label>
                  <Textarea 
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <Button className="btn-primary" onClick={handleAddMaterial}>
                  {t('admin.materials.add')}
                </Button>
              </div>
            </div>

            <h2 className="heading-1" style={{ marginBottom: '24px' }}>
              {t('admin.materials.title')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {materials.map((material) => (
                <div 
                  key={material.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '20px'
                  }}
                >
                  <h3 className="heading-2">{material.name}</h3>
                  <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                    {material.price} {language === 'ru' ? 'лей/кг' : 'lei/kg'}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '40px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '24px' }}>
                {t('admin.settings.title')}
              </h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <Label className="body-medium">{t('admin.settings.electricity')}</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={settings.electricity}
                    onChange={(e) => setSettings({...settings, electricity: parseFloat(e.target.value)})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <Label className="body-medium">{t('admin.settings.postProcessing')}</Label>
                  <Input 
                    type="number"
                    value={settings.postProcessing}
                    onChange={(e) => setSettings({...settings, postProcessing: parseFloat(e.target.value)})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <Label className="body-medium">{t('admin.settings.markup')}</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={settings.markup}
                    onChange={(e) => setSettings({...settings, markup: parseFloat(e.target.value)})}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <Button 
                  className="btn-primary"
                  onClick={() => toast.success(language === 'ru' ? 'Настройки сохранены' : 'Setări salvate')}
                >
                  {language === 'ru' ? 'Сохранить' : 'Salvează'}
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
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockMaterials } from '../mock';
import { materialsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Upload, MessageCircle, X, Loader2, Send, Maximize2, Clock, CheckCircle, RotateCcw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '../components/AuthModal';

const STLViewer = lazy(() => import('../components/STLViewer'));

// Color name to hex mapping
const colorMap = {
  'Зелёный': '#22c55e', 'Зеленый': '#22c55e', 'Green': '#22c55e',
  'Белый': '#ffffff', 'White': '#ffffff',
  'Чёрный': '#1a1a1a', 'Черный': '#1a1a1a', 'Black': '#1a1a1a',
  'Красный': '#ef4444', 'Red': '#ef4444',
  'Жёлтый': '#eab308', 'Желтый': '#eab308', 'Yellow': '#eab308',
  'Оранжевый': '#f97316', 'Orange': '#f97316',
  'Синий': '#3b82f6', 'Blue': '#3b82f6',
  'Серый': '#6b7280', 'Gray': '#6b7280', 'Grey': '#6b7280',
  'Розовый': '#ec4899', 'Pink': '#ec4899',
  'Фиолетовый': '#8b5cf6', 'Purple': '#8b5cf6',
  'Коричневый': '#92400e', 'Brown': '#92400e',
  'Бежевый': '#d4a574', 'Beige': '#d4a574',
  'Прозрачный': 'transparent', 'Transparent': 'transparent',
  'Натуральный': '#f5f5dc', 'Natural': '#f5f5dc'
};

const Calculator = () => {
  const { t, language } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [operatorChoice, setOperatorChoice] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [loads, setLoads] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infill, setInfill] = useState('20');
  const [layerHeight, setLayerHeight] = useState('0.2');
  const [orderHistory, setOrderHistory] = useState([]);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null); // null, 'pending', 'approved', 'price_changed'
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [confirmedPrice, setConfirmedPrice] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({ x: '', y: '', z: '' });

  const maxBuildVolume = { x: 300, y: 300, z: 330 };

  useEffect(() => {
    loadMaterials();
    loadOrderHistory();
  }, []);

  // Poll for order status updates
  useEffect(() => {
    if (currentOrderId && orderStatus === 'pending') {
      const interval = setInterval(() => {
        checkOrderStatus(currentOrderId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentOrderId, orderStatus]);

  useEffect(() => {
    if (dimensions) {
      setCustomDimensions({
        x: (dimensions.x * scale).toFixed(1),
        y: (dimensions.y * scale).toFixed(1),
        z: (dimensions.z * scale).toFixed(1)
      });
    }
  }, [dimensions, scale]);

  useEffect(() => {
    if (dimensions && selectedMaterial && !operatorChoice) {
      calculatePrice();
    }
  }, [dimensions, selectedMaterial, scale, infill, layerHeight]);

  const loadOrderHistory = () => {
    const history = localStorage.getItem('orderHistory');
    if (history) setOrderHistory(JSON.parse(history));
  };

  const saveToHistory = (order) => {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    // Check if order already exists
    const existingIndex = history.findIndex(h => h.orderId === order.orderId);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...order };
    } else {
      history.unshift({ ...order, date: new Date().toISOString() });
    }
    localStorage.setItem('orderHistory', JSON.stringify(history.slice(0, 20)));
    setOrderHistory(history.slice(0, 20));
  };

  const checkOrderStatus = async (orderId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'approved' || data.status === 'price_changed') {
          setOrderStatus(data.status);
          if (data.finalCost) {
            setConfirmedPrice(data.finalCost);
          } else if (data.status === 'approved') {
            setConfirmedPrice(estimatedPrice?.total);
          }
          // Update history
          saveToHistory({
            orderId,
            status: data.status,
            finalCost: data.finalCost,
            estimatedCost: estimatedPrice?.total
          });
          toast.success(
            data.status === 'price_changed' 
              ? (language === 'ru' ? '💰 Цена подтверждена оператором!' : '💰 Preț confirmat de operator!')
              : (language === 'ru' ? '✅ Заказ подтверждён оператором!' : '✅ Comandă confirmată de operator!')
          );
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await materialsAPI.getAll();
      setMaterials(data.length > 0 ? data : mockMaterials);
    } catch (error) {
      const saved = localStorage.getItem('materials');
      setMaterials(saved ? JSON.parse(saved) : mockMaterials);
    }
    setLoading(false);
  };

  const calculatePrice = async () => {
    if (!dimensions || !selectedMaterial) return;

    const material = materials.find(m => m.id === selectedMaterial);
    if (!material) return;

    const ELECTRICITY_COST_PER_KW = 20;
    const PRINTER_POWER_WATTS = 350;
    const PRINTER_AMORTIZATION_PER_HOUR = 22;
    const MARKUP_COEFFICIENT = 1.3;
    
    const densityMap = { 'PLA': 1.24, 'ABS': 1.04, 'PETG': 1.27, 'TPU': 1.21, 'Nylon': 1.14 };
    const materialPriceMap = { 'PLA': 290, 'PETG': 320, 'ABS': 300, 'TPU': 450, 'Nylon': 550 };
    const printSpeedMap = { '0.15': 15, '0.2': 25, '0.28': 35, '0.32': 45 };
    
    const density = densityMap[material.type] || 1.24;
    const materialPrice = material.price || materialPriceMap[material.type] || 290;
    const printSpeed = printSpeedMap[layerHeight] || 25;
    const infillPercent = parseInt(infill) / 100;
    
    const volumeMm3 = dimensions.x * dimensions.y * dimensions.z * Math.pow(scale, 3);
    const volumeCm3 = volumeMm3 / 1000;
    const weight = volumeCm3 * density * (0.15 + 0.85 * infillPercent);
    const printTimeHours = weight / printSpeed;
    const printTimeMinutes = printTimeHours * 60;
    
    const plasticCost = (weight / 1000) * materialPrice;
    const electricityCost = printTimeHours * (PRINTER_POWER_WATTS / 1000) * ELECTRICITY_COST_PER_KW;
    const amortizationCost = printTimeHours * PRINTER_AMORTIZATION_PER_HOUR;
    const baseCost = plasticCost + electricityCost + amortizationCost;
    const total = Math.round(baseCost * MARKUP_COEFFICIENT);
    const finalTotal = Math.max(50, total);
    
    setEstimatedPrice({ 
      weight: weight.toFixed(1), 
      time: printTimeHours.toFixed(1), 
      timeMinutes: Math.round(printTimeMinutes),
      plasticCost: Math.round(plasticCost),
      electricityCost: Math.round(electricityCost),
      amortizationCost: Math.round(amortizationCost),
      total: finalTotal 
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext === 'stl' || ext === 'obj';
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      // Reset order state when new file uploaded
      setOrderStatus(null);
      setCurrentOrderId(null);
      setConfirmedPrice(null);
      toast.success(`✅ ${language === 'ru' ? `Загружено: ${validFiles.length}` : `Încărcat: ${validFiles.length}`}`);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setDimensions(null);
      setScale(1);
      setEstimatedPrice(null);
      setOrderStatus(null);
      setCurrentOrderId(null);
      setConfirmedPrice(null);
    }
  };

  const handleScaleChange = (newScale) => {
    if (!dimensions) return;
    if (dimensions.x * newScale > maxBuildVolume.x ||
        dimensions.y * newScale > maxBuildVolume.y ||
        dimensions.z * newScale > maxBuildVolume.z) {
      const maxScaleX = maxBuildVolume.x / dimensions.x;
      const maxScaleY = maxBuildVolume.y / dimensions.y;
      const maxScaleZ = maxBuildVolume.z / dimensions.z;
      newScale = Math.min(maxScaleX, maxScaleY, maxScaleZ);
      toast.warning(language === 'ru' ? 'Достигнут максимальный размер' : 'Dimensiune maximă atinsă');
    }
    setScale(newScale);
  };

  const handleDimensionInput = (axis, value) => {
    if (!dimensions) return;
    setCustomDimensions(prev => ({ ...prev, [axis]: value }));
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    const newScale = numValue / dimensions[axis];
    handleScaleChange(newScale);
  };

  const resetScale = () => {
    setScale(1);
    if (dimensions) {
      setCustomDimensions({
        x: dimensions.x.toFixed(1),
        y: dimensions.y.toFixed(1),
        z: dimensions.z.toFixed(1)
      });
    }
    toast.success(language === 'ru' ? 'Масштаб сброшен' : 'Scală resetată');
  };

  const handleMaterialSelect = (materialId) => {
    setSelectedMaterial(materialId);
    setSelectedColor(null);
  };

  const getColorHex = (colorName) => colorMap[colorName] || '#9ca3af';

  // Step 1: Send for confirmation (without customer data)
  const handleSendForConfirmation = async () => {
    if (selectedFiles.length === 0) {
      toast.error(language === 'ru' ? 'Загрузите файл' : 'Încărcați un fișier');
      return;
    }
    if (!operatorChoice && !selectedMaterial) {
      toast.error(language === 'ru' ? 'Выберите материал' : 'Alegeți materialul');
      return;
    }

    setLoading(true);
    try {
      const material = materials.find(m => m.id === selectedMaterial);
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('operatorChoice', operatorChoice);
        formData.append('scale', scale.toString());
        formData.append('infill', infill);
        formData.append('layerHeight', layerHeight);
        formData.append('awaitingConfirmation', 'true'); // Flag for first step
        
        // Pass the calculated price from frontend
        if (estimatedPrice) {
          formData.append('clientPrice', estimatedPrice.total.toString());
          formData.append('clientWeight', estimatedPrice.weight.toString());
          formData.append('clientTime', estimatedPrice.time.toString());
        }
        
        if (!operatorChoice && selectedMaterial) {
          formData.append('materialId', selectedMaterial);
          formData.append('materialName', language === 'ru' ? material.name : material.nameRo);
          if (selectedColor) formData.append('color', selectedColor);
        }
        
        if (purpose) formData.append('purpose', purpose);
        if (loads) formData.append('loads', loads);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/upload`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentOrderId(data.orderId);
          setOrderStatus('pending');
          
          saveToHistory({
            orderId: data.orderId,
            fileName: file.name,
            materialName: material ? (language === 'ru' ? material.name : material.nameRo) : 'Выбор оператора',
            infill: infill + '%',
            color: selectedColor,
            status: 'pending',
            estimatedCost: estimatedPrice?.total
          });
          
          toast.success(language === 'ru' ? '📤 Отправлено оператору!' : '📤 Trimis operatorului!');
        }
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка отправки' : 'Eroare la trimitere');
    }
    setLoading(false);
  };

  // Step 2: Place order (with customer data)
  const handlePlaceOrder = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async (userData) => {
    // Send second notification with customer data
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${currentOrderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${userData.firstName} ${userData.lastName}`,
          customerPhone: userData.phone,
          customerEmail: userData.email || '',
          authMethod: userData.authMethod,
          finalCost: confirmedPrice || estimatedPrice?.total
        })
      });

      if (response.ok) {
        setOrderStatus('completed');
        saveToHistory({
          orderId: currentOrderId,
          status: 'ordered',
          customerName: `${userData.firstName} ${userData.lastName}`
        });
        
        toast.success(language === 'ru' ? '🎉 Заказ оформлен!' : '🎉 Comandă plasată!');
        
        // Reset for new order
        setTimeout(() => {
          setSelectedFiles([]);
          setSelectedMaterial(null);
          setSelectedColor(null);
          setScale(1);
          setDimensions(null);
          setEstimatedPrice(null);
          setOrderStatus(null);
          setCurrentOrderId(null);
          setConfirmedPrice(null);
        }, 2000);
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка оформления' : 'Eroare la plasare');
    }
    setLoading(false);
  };

  const currentMaterial = materials.find(m => m.id === selectedMaterial);

  const layerHeights = [
    { value: '0.15', label: '0.15mm', desc: language === 'ru' ? 'Качество' : 'Calitate' },
    { value: '0.2', label: '0.2mm', desc: language === 'ru' ? 'Стандарт' : 'Standard' },
    { value: '0.28', label: '0.28mm', desc: language === 'ru' ? 'Быстро' : 'Rapid' },
    { value: '0.32', label: '0.32mm', desc: language === 'ru' ? 'Макс' : 'Max' }
  ];

  return (
    <div className="dark-container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h1 className="display-large" style={{ marginBottom: '40px', textAlign: 'center' }}>
          {t('calculator.title')}
        </h1>

        <div className="calculator-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 3D Preview */}
          {selectedFiles.length > 0 && (
            <div className="preview-section">
              <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>
                🎮 {language === 'ru' ? '3D Просмотр' : 'Previzualizare 3D'}
              </h3>
              <Suspense fallback={
                <div style={{ height: '300px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--brand-primary)" />
                </div>
              }>
                <STLViewer file={selectedFiles[0]} scale={scale} onDimensionsChange={setDimensions} />
              </Suspense>

              {/* Scale Control */}
              {dimensions && (
                <div style={{
                  marginTop: '16px',
                  background: 'var(--bg-secondary)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={resetScale} title={language === 'ru' ? 'Сбросить масштаб' : 'Resetează scala'}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border-medium)',
                        background: scale !== 1 ? 'var(--brand-hover)' : 'var(--bg-primary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: scale !== 1 ? 1 : 0.5 }}>
                      <RotateCcw size={18} color={scale !== 1 ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    </button>
                    <Maximize2 size={18} color="var(--brand-primary)" />
                    <h4 style={{ fontWeight: 600, margin: 0 }}>
                      {language === 'ru' ? 'Масштаб' : 'Scală'}: {(scale * 100).toFixed(0)}%
                    </h4>
                    {scale !== 1 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>(изменён)</span>}
                  </div>
                  
                  <input type="range" min="0.1" max="3" step="0.1" value={scale}
                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                    style={{ width: '100%', height: '8px', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px',
                      background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${(scale / 3) * 100}%, var(--border-medium) ${(scale / 3) * 100}%, var(--border-medium) 100%)` }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['x', 'y', 'z'].map((axis) => (
                      <div key={axis} style={{ textAlign: 'center' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px',
                          color: axis === 'x' ? '#ef4444' : axis === 'y' ? '#22c55e' : '#3b82f6' }}>{axis.toUpperCase()}</label>
                        <input type="number" value={customDimensions[axis]}
                          onChange={(e) => handleDimensionInput(axis, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          style={{ width: '100%', padding: '10px 8px', borderRadius: '8px', border: '2px solid var(--border-medium)',
                            background: 'var(--bg-primary)', textAlign: 'center', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>mm</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--brand-hover)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    📦 Макс: {maxBuildVolume.x}×{maxBuildVolume.y}×{maxBuildVolume.z}mm
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Section */}
          <div>
            {/* File Upload */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '28px', marginBottom: '20px', borderRadius: '16px' }}>
              <h2 className="heading-1" style={{ marginBottom: '12px' }}>{t('calculator.upload.title')}</h2>
              <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{t('calculator.upload.desc')}</p>
              
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                <input type="file" accept=".stl,.obj" onChange={handleFileChange} multiple style={{ display: 'none' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: 'var(--brand-gradient)', color: 'white', fontWeight: 600 }}>
                  <Upload size={20} /> {t('calculator.upload.button')}
                </span>
              </label>

              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--brand-hover)', borderRadius: '8px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>📄 {file.name}</span>
                      <button onClick={() => removeFile(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={18} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Material Selection */}
            {selectedFiles.length > 0 && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '28px', marginBottom: '20px', borderRadius: '16px' }}>
                <h2 className="heading-1" style={{ marginBottom: '20px' }}>{t('calculator.material.title')}</h2>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={operatorChoice}
                    onChange={(e) => { setOperatorChoice(e.target.checked); if (e.target.checked) { setSelectedMaterial(null); setSelectedColor(null); setEstimatedPrice(null); } }}
                    style={{ width: '20px', height: '20px' }} />
                  <span className="body-medium">{t('calculator.material.notSure')}</span>
                </label>

                {operatorChoice && (
                  <div style={{ marginBottom: '20px' }}>
                    <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                      placeholder={language === 'ru' ? 'Опишите назначение и требования...' : 'Descrieți scopul și cerințele...'}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', marginBottom: '12px' }} />
                    <Textarea value={loads} onChange={(e) => setLoads(e.target.value)}
                      placeholder={language === 'ru' ? 'Какие нагрузки будут?' : 'Ce sarcini vor fi?'}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-medium)' }} />
                  </div>
                )}

                {!operatorChoice && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {materials.map((material) => (
                      <div key={material.id}>
                        <div onClick={() => handleMaterialSelect(material.id)}
                          style={{ background: selectedMaterial === material.id ? 'var(--brand-hover)' : 'var(--bg-primary)',
                            border: `2px solid ${selectedMaterial === material.id ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                            padding: '16px 20px', cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ marginBottom: '4px', fontWeight: 600, color: selectedMaterial === material.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                                {language === 'ru' ? material.name : material.nameRo}
                              </h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {language === 'ru' ? material.description : material.descriptionRo}
                              </p>
                            </div>
                            {material.colors && material.colors.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {material.colors.slice(0, 6).map((color, idx) => (
                                  <div key={idx} style={{ width: '20px', height: '20px', borderRadius: '50%', background: getColorHex(color),
                                    border: color.includes('Белый') || color.includes('White') ? '1px solid #ddd' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} title={color} />
                                ))}
                                {material.colors.length > 6 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{material.colors.length - 6}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedMaterial === material.id && material.colors && material.colors.length > 0 && (
                          <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
                            <Label style={{ marginBottom: '12px', display: 'block', fontWeight: 600 }}>🎨 {language === 'ru' ? 'Выберите цвет:' : 'Alegeți culoarea:'}</Label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {material.colors.map((color, idx) => (
                                <button key={idx} onClick={() => setSelectedColor(color)} title={color}
                                  style={{ width: '44px', height: '44px', borderRadius: '50%', background: getColorHex(color), cursor: 'pointer',
                                    border: selectedColor === color ? '3px solid var(--brand-primary)' : color.includes('Белый') || color.includes('White') ? '2px solid #ddd' : '2px solid transparent',
                                    boxShadow: selectedColor === color ? '0 0 0 3px var(--brand-hover), 0 4px 12px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.15)',
                                    transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s ease', position: 'relative' }}>
                                  {selectedColor === color && (
                                    <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '18px', height: '18px', background: 'var(--brand-primary)',
                                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Print Settings */}
            {selectedFiles.length > 0 && selectedMaterial && !operatorChoice && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '28px', marginBottom: '20px', borderRadius: '16px' }}>
                <h2 className="heading-1" style={{ marginBottom: '20px' }}>⚙️ {language === 'ru' ? 'Настройки печати' : 'Setări printare'}</h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <Label style={{ marginBottom: '12px', display: 'block' }}>{language === 'ru' ? 'Заполнение:' : 'Umplere:'} <strong>{infill}%</strong></Label>
                  <input type="range" min="10" max="100" step="10" value={infill} onChange={(e) => setInfill(e.target.value)} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div>
                  <Label style={{ marginBottom: '12px', display: 'block' }}>🔬 {language === 'ru' ? 'Высота слоя' : 'Înălțime strat'}</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {layerHeights.map((h) => (
                      <div key={h.value} onClick={() => setLayerHeight(h.value)}
                        style={{ padding: '10px 6px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                          border: `2px solid ${layerHeight === h.value ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                          background: layerHeight === h.value ? 'var(--brand-hover)' : 'var(--bg-primary)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--brand-primary)', fontSize: '14px' }}>{h.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price Preview */}
            {selectedFiles.length > 0 && estimatedPrice && (
              <div style={{
                background: orderStatus === 'price_changed' || orderStatus === 'approved' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                padding: '24px', borderRadius: '16px', color: 'white', marginBottom: '20px'
              }}>
                <h4 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '18px' }}>
                  {orderStatus === 'price_changed' || orderStatus === 'approved'
                    ? (language === 'ru' ? '✅ Цена подтверждена' : '✅ Preț confirmat')
                    : (language === 'ru' ? '💰 Предварительная стоимость' : '💰 Cost estimat')
                  }
                </h4>
                
                <div style={{ fontSize: '44px', fontWeight: 700, marginBottom: '16px' }}>
                  {confirmedPrice && confirmedPrice !== estimatedPrice.total ? (
                    <>
                      <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '28px', marginRight: '12px' }}>
                        ~{estimatedPrice.total} MDL
                      </span>
                      {confirmedPrice} MDL
                    </>
                  ) : (
                    <>~{estimatedPrice.total} MDL</>
                  )}
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ opacity: 0.85, marginBottom: '4px' }}>⚖️ {language === 'ru' ? 'Вес' : 'Greutate'}</div>
                      <div style={{ fontWeight: 700, fontSize: '18px' }}>{estimatedPrice.weight} г</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ opacity: 0.85, marginBottom: '4px' }}>⏱️ {language === 'ru' ? 'Время печати' : 'Timp printare'}</div>
                      <div style={{ fontWeight: 700, fontSize: '18px' }}>{estimatedPrice.time} ч</div>
                    </div>
                  </div>
                </div>
                
                {orderStatus !== 'approved' && orderStatus !== 'price_changed' && (
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    * {language === 'ru' ? 'Окончательная цена будет подтверждена оператором' : 'Prețul final va fi confirmat de operator'}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {selectedFiles.length > 0 && (
              <div>
                {/* Step 1: Send for confirmation */}
                {!orderStatus && (
                  <>
                    <Button onClick={handleSendForConfirmation} disabled={loading}
                      style={{ width: '100%', height: '56px', fontSize: '17px', borderRadius: '14px', marginBottom: '16px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                      {loading ? <Loader2 className="animate-spin" size={22} /> : (
                        <><Send size={20} style={{ marginRight: '10px' }} />{language === 'ru' ? 'Отправить для подтверждения' : 'Trimite pentru confirmare'}</>
                      )}
                    </Button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Clock size={20} color="#3b82f6" />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {language === 'ru' 
                          ? 'Для оформления заказа нужно подтверждение цены оператором. Это займёт от нескольких секунд до пары минут.' 
                          : 'Pentru plasarea comenzii este necesară confirmarea prețului de către operator. Aceasta va dura de la câteva secunde până la câteva minute.'}
                      </span>
                    </div>
                  </>
                )}

                {/* Waiting for confirmation */}
                {orderStatus === 'pending' && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    padding: '16px 20px', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}>
                    {/* Realistic mini 3D printer animation */}
                    <div style={{ flexShrink: 0 }}>
                      <div className="realistic-printer">
                        <div className="printer-frame">
                          <div className="printer-rod left-rod"></div>
                          <div className="printer-rod right-rod"></div>
                          <div className="printer-gantry">
                            <div className="print-head">
                              <div className="nozzle-tip"></div>
                            </div>
                          </div>
                          <div className="print-bed">
                            <div className="printing-object"></div>
                          </div>
                          <div className="printer-lcd">
                            <div className="lcd-bar"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#1e293b' }}>
                        {language === 'ru' ? '⏳ Ожидание подтверждения' : '⏳ Așteptare confirmare'}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        {language === 'ru' ? 'Оператор проверяет вашу модель' : 'Operatorul verifică modelul dvs.'}
                      </p>
                    </div>
                    <div className="pulse-indicator"></div>
                  </div>
                )}
                    <Loader2 className="animate-spin" size={24} color="var(--brand-primary)" />
                  </div>
                )}

                {/* Step 2: Place order (after confirmation) */}
                {(orderStatus === 'approved' || orderStatus === 'price_changed') && (
                  <Button onClick={handlePlaceOrder} disabled={loading}
                    style={{ width: '100%', height: '56px', fontSize: '17px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    {loading ? <Loader2 className="animate-spin" size={22} /> : (
                      <><ShoppingCart size={20} style={{ marginRight: '10px' }} />{language === 'ru' ? 'Оформить заказ' : 'Plasează comanda'}</>
                    )}
                  </Button>
                )}

                {/* Ask operator button */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Button className="btn-secondary" onClick={() => window.open('https://t.me/Shiftprint', '_blank')}
                    style={{ background: 'transparent', border: '1px solid var(--border-medium)' }}>
                    <MessageCircle size={18} style={{ marginRight: '8px' }} />
                    {t('calculator.askOperator')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        {orderHistory.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              📋 {language === 'ru' ? 'История запросов' : 'Istoric cereri'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderHistory.slice(0, 10).map((order, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '24px' }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{order.fileName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {order.materialName} • {order.infill}
                        {order.date && ` • ${new Date(order.date).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Price with strikethrough if changed */}
                    {order.finalCost && order.estimatedCost && order.finalCost !== order.estimatedCost ? (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '13px' }}>
                          ~{order.estimatedCost} MDL
                        </span>
                        <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{order.finalCost} MDL</div>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600 }}>
                        {order.finalCost || order.estimatedCost ? `~${order.finalCost || order.estimatedCost} MDL` : ''}
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                      background: order.status === 'approved' || order.status === 'price_changed' || order.status === 'ordered'
                        ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: order.status === 'approved' || order.status === 'price_changed' || order.status === 'ordered'
                        ? '#10b981' : '#f59e0b'
                    }}>
                      {order.status === 'approved' || order.status === 'price_changed' || order.status === 'ordered' ? (
                        <><CheckCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{language === 'ru' ? 'Подтверждён' : 'Confirmat'}</>
                      ) : (
                        <><Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{language === 'ru' ? 'В ожидании' : 'În așteptare'}</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No File Section */}
        {selectedFiles.length === 0 && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '48px', marginTop: '40px', textAlign: 'center', borderRadius: '16px' }}>
            <h2 className="heading-1" style={{ marginBottom: '12px' }}>{t('calculator.noFile.title')}</h2>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>{t('calculator.noFile.desc')}</p>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
};

export default Calculator;

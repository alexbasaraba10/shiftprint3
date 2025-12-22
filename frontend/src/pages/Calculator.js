import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockMaterials } from '../mock';
import { materialsAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Upload, MessageCircle, X, Loader2, Lock, Maximize2, ShieldCheck, RotateCcw } from 'lucide-react';
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
  const [pendingOrder, setPendingOrder] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({ x: '', y: '', z: '' });

  const maxBuildVolume = { x: 300, y: 300, z: 330 };

  useEffect(() => {
    loadMaterials();
    loadOrderHistory();
  }, []);

  // Update custom dimensions when scale or dimensions change
  useEffect(() => {
    if (dimensions) {
      setCustomDimensions({
        x: (dimensions.x * scale).toFixed(1),
        y: (dimensions.y * scale).toFixed(1),
        z: (dimensions.z * scale).toFixed(1)
      });
    }
  }, [dimensions, scale]);

  // Calculate price when parameters change
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
    history.unshift({ ...order, date: new Date().toISOString(), id: Date.now() });
    localStorage.setItem('orderHistory', JSON.stringify(history.slice(0, 10)));
    setOrderHistory(history.slice(0, 10));
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

    // ===== НАСТРОЙКИ ИЗ ТАБЛИЦЫ =====
    const ELECTRICITY_COST_PER_KW = 20;      // MDL за 1000 Ватт (кВт) в час
    const PRINTER_POWER_WATTS = 350;          // Мощность принтера в ваттах (средняя для FDM)
    const PRINTER_AMORTIZATION_PER_HOUR = 22; // Амортизация принтера MDL/час
    const MARKUP_COEFFICIENT = 1.3;           // Наценка 30%
    
    // Плотность материалов (г/см³)
    const densityMap = { 
      'PLA': 1.24, 
      'ABS': 1.04, 
      'PETG': 1.27, 
      'TPU': 1.21, 
      'Nylon': 1.14 
    };
    
    // Цены материалов из таблицы (MDL/кг) - можно переопределить из базы данных
    const materialPriceMap = {
      'PLA': 290,
      'PETG': 320,
      'ABS': 300,
      'TPU': 450,
      'Nylon': 550
    };
    
    // Скорость печати (г/час) зависит от высоты слоя
    const printSpeedMap = {
      '0.15': 15,   // качество - медленно
      '0.2': 25,    // стандарт
      '0.28': 35,   // быстро
      '0.32': 45    // максимум
    };
    
    const density = densityMap[material.type] || 1.24;
    const materialPrice = material.price || materialPriceMap[material.type] || 290;
    const printSpeed = printSpeedMap[layerHeight] || 25;
    const infillPercent = parseInt(infill) / 100;
    
    // 1. Расчёт веса (объём из STL уже в мм³)
    // Используем реальный объём модели с учётом масштаба
    const volumeMm3 = dimensions.x * dimensions.y * dimensions.z * Math.pow(scale, 3);
    const volumeCm3 = volumeMm3 / 1000;
    
    // Вес = объём × плотность × (стенки 20% + заполнение)
    const weight = volumeCm3 * density * (0.15 + 0.85 * infillPercent);
    
    // 2. Время печати в часах
    const printTimeHours = weight / printSpeed;
    const printTimeMinutes = printTimeHours * 60;
    
    // 3. Стоимость пластика (MDL)
    // Формула: (Вес в граммах / 1000) × Цена за кг
    const plasticCost = (weight / 1000) * materialPrice;
    
    // 4. Стоимость электричества (MDL)
    // Формула: (Время в часах) × (Мощность в кВт) × (Цена за кВт)
    const electricityCost = printTimeHours * (PRINTER_POWER_WATTS / 1000) * ELECTRICITY_COST_PER_KW;
    
    // 5. Амортизация принтера (MDL)
    // Формула: Время в часах × Амортизация за час
    const amortizationCost = printTimeHours * PRINTER_AMORTIZATION_PER_HOUR;
    
    // 6. Итого (с наценкой)
    const baseCost = plasticCost + electricityCost + amortizationCost;
    const total = Math.round(baseCost * MARKUP_COEFFICIENT);
    
    // Минимальная стоимость 50 MDL
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
      toast.success(`✅ ${language === 'ru' ? `Загружено: ${validFiles.length}` : `Încărcat: ${validFiles.length}`}`);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setDimensions(null);
      setScale(1);
      setEstimatedPrice(null);
    }
  };

  const handleScaleChange = (newScale) => {
    if (!dimensions) return;
    
    // Check build volume limits
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
    
    // Update the input field value immediately
    setCustomDimensions(prev => ({ ...prev, [axis]: value }));
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return;
    }
    
    // Calculate new scale based on the changed dimension
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

  const getColorHex = (colorName) => {
    return colorMap[colorName] || '#9ca3af';
  };

  const handleOrder = async () => {
    if (selectedFiles.length === 0) {
      toast.error(language === 'ru' ? 'Загрузите файл' : 'Încărcați un fișier');
      return;
    }
    if (!operatorChoice && !selectedMaterial) {
      toast.error(language === 'ru' ? 'Выберите материал' : 'Alegeți materialul');
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      setPendingOrder(true);
      setShowAuthModal(true);
      return;
    }

    await submitOrder();
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const material = materials.find(m => m.id === selectedMaterial);
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('operatorChoice', operatorChoice);
        formData.append('scale', scale.toString());
        formData.append('infill', infill);
        formData.append('layerHeight', layerHeight);
        formData.append('customerPhone', userData.phone || '');
        formData.append('customerName', `${userData.firstName || ''} ${userData.lastName || ''}`);
        
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
          saveToHistory({
            fileName: file.name,
            materialName: material ? (language === 'ru' ? material.name : material.nameRo) : 'Выбор оператора',
            infill: infill + '%',
            color: selectedColor,
            status: 'pending',
            orderId: data.orderId
          });
        }
      }

      toast.success(language === 'ru' ? 'Заказ отправлен!' : 'Comandă trimisă!');
      setSelectedFiles([]);
      setSelectedMaterial(null);
      setSelectedColor(null);
      setScale(1);
      setDimensions(null);
      setEstimatedPrice(null);
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка отправки' : 'Eroare la trimitere');
    }
    setLoading(false);
  };

  const handleAuthSuccess = async () => {
    if (pendingOrder) {
      setPendingOrder(false);
      await submitOrder();
    }
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
          
          {/* 3D Preview - Top on mobile */}
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

              {/* Scale Control - One slider + dimension inputs */}
              {dimensions && (
                <div style={{
                  marginTop: '16px',
                  background: 'var(--bg-secondary)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    {/* Reset Button */}
                    <button
                      onClick={resetScale}
                      title={language === 'ru' ? 'Сбросить масштаб' : 'Resetează scala'}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '2px solid var(--border-medium)',
                        background: scale !== 1 ? 'var(--brand-hover)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        opacity: scale !== 1 ? 1 : 0.5
                      }}
                    >
                      <RotateCcw size={18} color={scale !== 1 ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    </button>
                    <Maximize2 size={18} color="var(--brand-primary)" />
                    <h4 style={{ fontWeight: 600, margin: 0 }}>
                      {language === 'ru' ? 'Масштаб' : 'Scală'}: {(scale * 100).toFixed(0)}%
                    </h4>
                    {scale !== 1 && (
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginLeft: 'auto'
                      }}>
                        {language === 'ru' ? '(изменён)' : '(modificat)'}
                      </span>
                    )}
                  </div>
                  
                  {/* Main Scale Slider */}
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${(scale / 3) * 100}%, var(--border-medium) ${(scale / 3) * 100}%, var(--border-medium) 100%)`,
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                  />

                  {/* Dimension Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['x', 'y', 'z'].map((axis) => (
                      <div key={axis} style={{ textAlign: 'center' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '12px', 
                          fontWeight: 600,
                          color: axis === 'x' ? '#ef4444' : axis === 'y' ? '#22c55e' : '#3b82f6',
                          marginBottom: '4px'
                        }}>
                          {axis.toUpperCase()}
                        </label>
                        <input
                          type="number"
                          value={customDimensions[axis]}
                          onChange={(e) => handleDimensionInput(axis, e.target.value)}
                          onBlur={(e) => {
                            // On blur, format the value properly
                            const numValue = parseFloat(e.target.value);
                            if (!isNaN(numValue) && numValue > 0) {
                              setCustomDimensions(prev => ({
                                ...prev,
                                [axis]: (dimensions[axis] * scale).toFixed(1)
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: '2px solid var(--border-medium)',
                            background: 'var(--bg-primary)',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            transition: 'border-color 0.2s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = axis === 'x' ? '#ef4444' : axis === 'y' ? '#22c55e' : '#3b82f6';
                            e.target.select();
                          }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>mm</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'var(--brand-hover)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)'
                  }}>
                    📦 {language === 'ru' ? `Макс: ${maxBuildVolume.x}×${maxBuildVolume.y}×${maxBuildVolume.z}mm` : `Max: ${maxBuildVolume.x}×${maxBuildVolume.y}×${maxBuildVolume.z}mm`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Section */}
          <div>
            {/* File Upload */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              marginBottom: '20px',
              borderRadius: '16px'
            }}>
              <h2 className="heading-1" style={{ marginBottom: '12px' }}>
                {t('calculator.upload.title')}
              </h2>
              <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t('calculator.upload.desc')}
              </p>
              
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                <input type="file" accept=".stl,.obj" onChange={handleFileChange} multiple style={{ display: 'none' }} />
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px',
                  borderRadius: '12px', background: 'var(--brand-gradient)', color: 'white', fontWeight: 600
                }}>
                  <Upload size={20} />
                  {t('calculator.upload.button')}
                </span>
              </label>

              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--brand-hover)', borderRadius: '8px', marginBottom: '8px'
                    }}>
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
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '28px',
                marginBottom: '20px',
                borderRadius: '16px'
              }}>
                <h2 className="heading-1" style={{ marginBottom: '20px' }}>
                  {t('calculator.material.title')}
                </h2>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={operatorChoice}
                    onChange={(e) => {
                      setOperatorChoice(e.target.checked);
                      if (e.target.checked) {
                        setSelectedMaterial(null);
                        setSelectedColor(null);
                        setEstimatedPrice(null);
                      }
                    }}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span className="body-medium">{t('calculator.material.notSure')}</span>
                </label>

                {operatorChoice && (
                  <div style={{ marginBottom: '20px' }}>
                    <Textarea 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder={language === 'ru' ? 'Опишите назначение и требования...' : 'Descrieți scopul și cerințele...'}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', marginBottom: '12px' }}
                    />
                    <Textarea 
                      value={loads}
                      onChange={(e) => setLoads(e.target.value)}
                      placeholder={language === 'ru' ? 'Какие нагрузки будут?' : 'Ce sarcini vor fi?'}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-medium)' }}
                    />
                  </div>
                )}

                {!operatorChoice && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {materials.map((material) => (
                      <div key={material.id}>
                        <div 
                          onClick={() => handleMaterialSelect(material.id)}
                          style={{
                            background: selectedMaterial === material.id ? 'var(--brand-hover)' : 'var(--bg-primary)',
                            border: `2px solid ${selectedMaterial === material.id ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                            padding: '16px 20px',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ 
                                marginBottom: '4px', fontWeight: 600,
                                color: selectedMaterial === material.id ? 'var(--brand-primary)' : 'var(--text-primary)'
                              }}>
                                {language === 'ru' ? material.name : material.nameRo}
                              </h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {language === 'ru' ? material.description : material.descriptionRo}
                              </p>
                            </div>
                            {/* Color preview circles */}
                            {material.colors && material.colors.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {material.colors.slice(0, 6).map((color, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: getColorHex(color),
                                      border: color.includes('Белый') || color.includes('White') ? '1px solid #ddd' : 'none',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}
                                    title={color}
                                  />
                                ))}
                                {material.colors.length > 6 && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                    +{material.colors.length - 6}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Color Selection with circles - NO TEXT, only color circles */}
                        {selectedMaterial === material.id && material.colors && material.colors.length > 0 && (
                          <div style={{
                            marginTop: '12px',
                            padding: '16px',
                            background: 'var(--bg-primary)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-medium)'
                          }}>
                            <Label style={{ marginBottom: '12px', display: 'block', fontWeight: 600 }}>
                              🎨 {language === 'ru' ? 'Выберите цвет:' : 'Alegeți culoarea:'}
                            </Label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {material.colors.map((color, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedColor(color)}
                                  title={color}
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: getColorHex(color),
                                    border: selectedColor === color 
                                      ? '3px solid var(--brand-primary)' 
                                      : color.includes('Белый') || color.includes('White')
                                        ? '2px solid #ddd'
                                        : '2px solid transparent',
                                    cursor: 'pointer',
                                    boxShadow: selectedColor === color 
                                      ? '0 0 0 3px var(--brand-hover), 0 4px 12px rgba(0,0,0,0.25)' 
                                      : '0 2px 6px rgba(0,0,0,0.15)',
                                    transition: 'all 0.2s ease',
                                    transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                                    position: 'relative'
                                  }}
                                >
                                  {selectedColor === color && (
                                    <span style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      right: '-4px',
                                      width: '18px',
                                      height: '18px',
                                      background: 'var(--brand-primary)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}>✓</span>
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
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '28px',
                marginBottom: '20px',
                borderRadius: '16px'
              }}>
                <h2 className="heading-1" style={{ marginBottom: '20px' }}>
                  ⚙️ {language === 'ru' ? 'Настройки печати' : 'Setări printare'}
                </h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <Label style={{ marginBottom: '12px', display: 'block' }}>
                    {language === 'ru' ? 'Заполнение:' : 'Umplere:'} <strong>{infill}%</strong>
                  </Label>
                  <input type="range" min="10" max="100" step="10" value={infill}
                    onChange={(e) => setInfill(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <Label style={{ marginBottom: '12px', display: 'block' }}>
                    🔬 {language === 'ru' ? 'Высота слоя' : 'Înălțime strat'}
                  </Label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {layerHeights.map((h) => (
                      <div key={h.value} onClick={() => setLayerHeight(h.value)}
                        style={{
                          padding: '10px 6px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                          border: `2px solid ${layerHeight === h.value ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                          background: layerHeight === h.value ? 'var(--brand-hover)' : 'var(--bg-primary)'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--brand-primary)', fontSize: '14px' }}>{h.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price Preview - MOVED HERE before Order Button */}
            {selectedFiles.length > 0 && estimatedPrice && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '24px',
                borderRadius: '16px',
                color: 'white',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '18px' }}>
                  💰 {language === 'ru' ? 'Предварительная стоимость' : 'Cost estimat'}
                </h4>
                <div style={{ fontSize: '44px', fontWeight: 700, marginBottom: '16px' }}>
                  ~{estimatedPrice.total} MDL
                </div>
                
                {/* Только основная информация для клиента */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  marginBottom: '12px'
                }}>
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
                
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  * {language === 'ru' ? 'Окончательная цена будет подтверждена оператором' : 'Prețul final va fi confirmat de operator'}
                </div>
              </div>
            )}

            {/* Order Button */}
            {selectedFiles.length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <Button className="btn-primary" onClick={handleOrder} disabled={loading} style={{ flex: 1, minWidth: '200px' }}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <><Lock size={18} />{language === 'ru' ? 'Оформить заказ' : 'Plasează comanda'}</>
                    )}
                  </Button>
                  <Button className="btn-secondary" onClick={() => window.open('https://t.me/Shiftprint', '_blank')}>
                    <MessageCircle size={20} />
                    {t('calculator.askOperator')}
                  </Button>
                </div>
                
                {/* SMS Verification Notice */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 18px',
                  background: 'rgba(14, 165, 233, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(14, 165, 233, 0.2)'
                }}>
                  <ShieldCheck size={20} color="#0ea5e9" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {language === 'ru' 
                      ? 'Для оформления заказа требуется подтверждение номера телефона с помощью SMS' 
                      : 'Pentru a plasa comanda, este necesară confirmarea numărului de telefon prin SMS'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No File Section */}
        {selectedFiles.length === 0 && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '48px',
            marginTop: '40px',
            textAlign: 'center',
            borderRadius: '16px'
          }}>
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

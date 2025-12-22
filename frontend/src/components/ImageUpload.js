import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

const ImageUpload = ({ value, onChange, label }) => {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        onChange(base64String);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Ошибка загрузки изображения');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          {label}
        </label>
      )}
      
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '2px solid var(--border-medium)',
              display: 'block'
            }}
          />
          <button
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(239, 68, 68, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <label style={{ display: 'inline-block', cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <div style={{
            border: '2px dashed var(--border-medium)',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.background = 'var(--brand-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
          >
            <Upload size={40} color="var(--brand-primary)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
              {uploading ? 'Загрузка...' : 'Загрузить изображение'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              PNG, JPG, WEBP до 5MB
            </p>
          </div>
        </label>
      )}
    </div>
  );
};

export default ImageUpload;

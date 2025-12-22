import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Grid, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

// Component to load and display STL model
function Model({ url, scale = 1, color = '#0ea5e9' }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef();

  useEffect(() => {
    if (geometry) {
      geometry.center();
      geometry.computeBoundingBox();
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} scale={scale}>
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// Auto-fit camera to model
function AutoFitCamera({ geometry }) {
  const { camera, scene } = useThree();
  
  useEffect(() => {
    if (geometry) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2;
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, 0, 0);
    }
  }, [geometry, camera, scene]);

  return null;
}

const STLViewer = ({ file, scale = 1, onDimensionsChange }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      
      // Parse STL to get dimensions
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loader = new STLLoader();
          const geometry = loader.parse(e.target.result);
          geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          const dims = {
            x: Math.abs(box.max.x - box.min.x),
            y: Math.abs(box.max.y - box.min.y),
            z: Math.abs(box.max.z - box.min.z)
          };
          setDimensions(dims);
          if (onDimensionsChange) onDimensionsChange(dims);
        } catch (err) {
          console.error('Error parsing STL:', err);
          setError('Не удалось прочитать файл');
        }
      };
      reader.readAsArrayBuffer(file);

      return () => URL.revokeObjectURL(url);
    }
  }, [file, onDimensionsChange]);

  if (error) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '2px dashed var(--border-medium)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '2px dashed var(--border-medium)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        📦 Загрузите STL файл для предпросмотра
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ height: '350px', width: '100%' }}>
        <Canvas
          camera={{ position: [100, 100, 100], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <Suspense fallback={null}>
            <Center>
              <Model url={fileUrl} scale={scale} />
            </Center>
          </Suspense>
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={2}
          />
          <Grid 
            infiniteGrid 
            fadeDistance={200}
            fadeStrength={1}
            cellSize={10}
            cellThickness={0.5}
            cellColor="#3b82f6"
            sectionSize={50}
            sectionThickness={1}
            sectionColor="#60a5fa"
          />
        </Canvas>
      </div>
      
      {/* Dimensions overlay */}
      {dimensions && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(0,0,0,0.7)',
          padding: '12px 16px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '13px',
          fontFamily: 'monospace'
        }}>
          <div style={{ marginBottom: '4px', color: '#60a5fa', fontWeight: 600 }}>Размеры модели:</div>
          <div>X: {(dimensions.x * scale).toFixed(1)}mm</div>
          <div>Y: {(dimensions.y * scale).toFixed(1)}mm</div>
          <div>Z: {(dimensions.z * scale).toFixed(1)}mm</div>
        </div>
      )}
      
      {/* Controls hint */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px 12px',
        borderRadius: '8px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '11px'
      }}>
        🖱️ Вращайте • Колёсико для масштаба
      </div>
    </div>
  );
};

export default STLViewer;

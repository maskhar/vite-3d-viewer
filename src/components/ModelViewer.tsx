import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import {
  X,
  RotateCw,
  Maximize,
  Minimize,
  Grid3x3,
  Lightbulb,
  Box,
} from 'lucide-react';
import Model3DComponent from './Model3D';
import ErrorBoundary from './ErrorBoundary';
import { Model3D, ViewerSettings } from '../types';
import './ModelViewer.css';

interface ModelViewerProps {
  model: Model3D | null;
  onClose: () => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ model, onClose }) => {
  const [settings, setSettings] = useState<ViewerSettings>({
    autoRotate: model?.viewer?.autoRotate ?? true,
    showGrid: false,
    wireframe: false,
    lightingIntensity: 1,
    background: 'dark',
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (model) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [model]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!model) return null;

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const getBackgroundColor = () => {
    switch (settings.background) {
      case 'light':
        return '#f0f0f0';
      case 'gradient':
        return '#1a1a26';
      default:
        return '#0a0a0f';
    }
  };

  return (
    <div className="viewer-modal" onClick={onClose}>
      <div
        ref={viewerRef}
        className="viewer-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="viewer-header">
          <div className="viewer-info">
            <h2 className="viewer-title">{model.name}</h2>
            <p className="viewer-category">{model.category}</p>
          </div>
          <button className="viewer-close" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="viewer-canvas">
          <ErrorBoundary fallback={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'white',
              background: getBackgroundColor()
            }}>
              <p>Unable to load 3D model</p>
            </div>
          }>
            <Canvas style={{ background: getBackgroundColor() }}>
              <Suspense fallback={null}>
                <PerspectiveCamera
                  makeDefault
                  position={model.viewer?.cameraPosition || [0, 2, 5]}
                />
                <ambientLight intensity={0.3 * settings.lightingIntensity} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={1 * settings.lightingIntensity}
                />
                <directionalLight
                  position={[-5, 5, -5]}
                  intensity={0.5 * settings.lightingIntensity}
                />
                <spotLight
                  position={[0, 10, 0]}
                  angle={0.3}
                  penumbra={1}
                  intensity={0.5 * settings.lightingIntensity}
                />
                {settings.showGrid && <Grid args={[10, 10]} />}
                <Model3DComponent
                  modelPath={model.modelPath}
                  autoRotate={settings.autoRotate}
                />
                <OrbitControls
                  ref={controlsRef}
                  enableDamping
                  dampingFactor={0.05}
                  autoRotate={settings.autoRotate}
                  autoRotateSpeed={model.viewer?.autoRotateSpeed || 0.5}
                />
              </Suspense>
            </Canvas>
          </ErrorBoundary>
        </div>

        <div className="viewer-controls">
          <div className="control-group">
            <button
              className={`control-btn ${settings.autoRotate ? 'active' : ''}`}
              onClick={() =>
                setSettings({ ...settings, autoRotate: !settings.autoRotate })
              }
              title="Auto Rotate"
            >
              <RotateCw size={18} />
              <span>Rotate</span>
            </button>

            <button
              className={`control-btn ${settings.showGrid ? 'active' : ''}`}
              onClick={() =>
                setSettings({ ...settings, showGrid: !settings.showGrid })
              }
              title="Show Grid"
            >
              <Grid3x3 size={18} />
              <span>Grid</span>
            </button>

            <button
              className={`control-btn ${settings.wireframe ? 'active' : ''}`}
              onClick={() =>
                setSettings({ ...settings, wireframe: !settings.wireframe })
              }
              title="Wireframe"
            >
              <Box size={18} />
              <span>Wire</span>
            </button>
          </div>

          <div className="control-group">
            <div className="control-slider">
              <Lightbulb size={16} />
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={settings.lightingIntensity}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lightingIntensity: parseFloat(e.target.value),
                  })
                }
                title="Lighting Intensity"
              />
            </div>

            <select
              className="control-select"
              value={settings.background}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  background: e.target.value as 'dark' | 'light' | 'gradient',
                })
              }
              title="Background"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          <div className="control-group">
            <button
              className="control-btn"
              onClick={handleResetCamera}
              title="Reset Camera"
            >
              Reset
            </button>

            <button
              className="control-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;

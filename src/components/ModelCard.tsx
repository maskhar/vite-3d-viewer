import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Model3DComponent from './Model3D';
import ErrorBoundary from './ErrorBoundary';
import { Model3D } from '../types';
import './ModelCard.css';

interface ModelCardProps {
  model: Model3D;
  onClick: () => void;
}

const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#6366f1" wireframe />
  </mesh>
);

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  return (
    <div className="model-card" onClick={onClick}>
      <div className="model-card-preview">
        <ErrorBoundary fallback={
          <div className="canvas-error">
            <p>Preview unavailable</p>
          </div>
        }>
          <Canvas>
            <Suspense fallback={<LoadingBox />}>
              <PerspectiveCamera
                makeDefault
                position={model.preview?.cameraPosition || [0, 0, 5]}
              />
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />
              <Model3DComponent
                modelPath={model.modelPath}
                rotation={model.preview?.rotation}
                scale={model.preview?.scale}
                autoRotate={true}
              />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
      <div className="model-card-info">
        <h3 className="model-card-name">{model.name}</h3>
        <p className="model-card-category">{model.category}</p>
        {model.description && (
          <p className="model-card-description">{model.description}</p>
        )}
      </div>
      <div className="model-card-overlay">
        <span className="view-model-text">View Model</span>
      </div>
    </div>
  );
};

export default ModelCard;

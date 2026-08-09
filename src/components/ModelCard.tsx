import React, { useState, useEffect, useRef } from 'react';
import { Model3D } from '../types';
import './ModelCard.css';

interface ModelCardProps {
  model: Model3D;
  onClick: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before card is visible
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef} className="model-card" onClick={onClick}>
      <div className="model-card-preview">
        {model.thumbnailPath ? (
          <>
            {!imageLoaded && (
              <div className="thumbnail-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
            <img
              src={isVisible ? model.thumbnailPath : ''}
              alt={model.name}
              className={`model-thumbnail ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            <div className="model-3d-badge">3D</div>
          </>
        ) : (
          <div className="thumbnail-placeholder">
            <span>No Preview</span>
          </div>
        )}
      </div>
      <div className="model-card-info">
        <h3 className="model-card-name">{model.name}</h3>
        <p className="model-card-category">{model.category}</p>
        {model.description && (
          <p className="model-card-description">{model.description}</p>
        )}
      </div>
      <div className="model-card-overlay">
        <span className="view-model-text">View 3D Model</span>
      </div>
    </div>
  );
};

export default ModelCard;

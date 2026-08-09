import React from 'react';
import ModelCard from './ModelCard';
import { Model3D } from '../types';
import './Catalog.css';

interface CatalogProps {
  models: Model3D[];
  onModelSelect: (model: Model3D) => void;
}

const Catalog: React.FC<CatalogProps> = ({ models, onModelSelect }) => {
  return (
    <section id="collection" className="catalog">
      <div className="catalog-container">
        <div className="catalog-header">
          <h2 className="catalog-title">ALL MODELS</h2>
          <p className="catalog-count">{models.length} Items</p>
        </div>
        <div className="catalog-grid">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onClick={() => onModelSelect(model)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Catalog;

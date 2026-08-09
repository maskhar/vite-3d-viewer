import React, { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import About from './components/About';
import ModelViewer from './components/ModelViewer';
import Footer from './components/Footer';
import { Model3D } from './types';
import { models } from './data';
import './App.css';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);

  useEffect(() => {
    // Preload all models to avoid multiple loading attempts
    models.forEach((model) => {
      console.log('Preloading model:', model.modelPath);
      useGLTF.preload(model.modelPath);
    });
  }, []);

  return (
    <div className="app">
      <Header />
      <Hero />
      <Catalog models={models} onModelSelect={setSelectedModel} />
      <About />
      <Footer />
      <ModelViewer model={selectedModel} onClose={() => setSelectedModel(null)} />
    </div>
  );
};

export default App;

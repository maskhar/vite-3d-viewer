import React, { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import About from '../components/About';
import ModelViewer from '../components/ModelViewer';
import Footer from '../components/Footer';
import { Model3D } from '../types';
import { supabase } from '../lib/supabase';
import { getModelUrl } from '../utils/storage';
import '../App.css';

const HomePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('models_catalog')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const transformedModels: Model3D[] = (data || []).map(model => ({
        id: model.id,
        name: model.name,
        category: model.category,
        description: model.description,
        modelPath: getModelUrl(model.model_filename),
        preview: {
          cameraPosition: [
            model.preview_camera_x || 0,
            model.preview_camera_y || 1,
            model.preview_camera_z || 5
          ],
          scale: model.preview_scale || 1,
        },
        viewer: {
          autoRotate: false,
          autoRotateSpeed: 0.5,
          cameraPosition: [0, 1, 5],
        },
      }));

      setModels(transformedModels);

      // Preload all models
      transformedModels.forEach((model) => {
        console.log('Preloading model:', model.modelPath);
        useGLTF.preload(model.modelPath);
      });
    } catch (error: any) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-semibold">Loading models...</p>
        </div>
      </div>
    );
  }

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

export default HomePage;

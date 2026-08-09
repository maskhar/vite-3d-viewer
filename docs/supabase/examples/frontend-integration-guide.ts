// ============================================
// Integrasi dengan Frontend Existing
// ============================================
// Cara mengubah src/data.ts untuk fetch dari Supabase

// BEFORE (Hardcoded data):
// ----------------------------------------
// import { Model3D } from './types';
// import { getModelUrl } from './utils/storage';
// 
// export const models: Model3D[] = [
//   {
//     id: '1',
//     name: 'Maskot FM 11',
//     category: 'Character',
//     ...
//   }
// ];

// AFTER (Fetch from Supabase):
// ----------------------------------------

import { Model3D } from './types';
import { supabase } from './lib/supabase';
import { getModelUrl } from './utils/storage';

/**
 * Fetch models dari Supabase database
 */
export async function fetchModelsFromDatabase(): Promise<Model3D[]> {
  try {
    // Menggunakan RPC function
    const { data, error } = await supabase.rpc('get_models_catalog', {
      p_active_only: true, // Hanya ambil yang aktif
    });

    if (error) {
      console.error('Error fetching models from Supabase:', error);
      return []; // Return empty array jika error
    }

    // Transform dari format database ke format Model3D
    return data.map((model: any) => ({
      id: model.id,
      name: model.name,
      category: model.category,
      description: model.description || undefined,
      modelPath: getModelUrl(model.model_filename),
      preview: {
        cameraPosition: model.preview.cameraPosition as [number, number, number],
        rotation: model.preview.rotation as [number, number, number],
        scale: model.preview.scale,
      },
      viewer: {
        autoRotate: model.viewer.autoRotate,
        autoRotateSpeed: model.viewer.autoRotateSpeed,
        cameraPosition: model.viewer.cameraPosition as [number, number, number],
      },
    }));
  } catch (error) {
    console.error('Unexpected error fetching models:', error);
    return [];
  }
}

/**
 * Alternatif: Direct query (tanpa RPC function)
 */
export async function fetchModelsDirectQuery(): Promise<Model3D[]> {
  try {
    const { data, error } = await supabase
      .from('models_catalog')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error:', error);
      return [];
    }

    return data.map((model: any) => ({
      id: model.id,
      name: model.name,
      category: model.category,
      description: model.description || undefined,
      modelPath: getModelUrl(model.model_filename),
      preview: {
        cameraPosition: [
          model.preview_camera_x,
          model.preview_camera_y,
          model.preview_camera_z,
        ] as [number, number, number],
        rotation: [
          model.preview_rotation_x,
          model.preview_rotation_y,
          model.preview_rotation_z,
        ] as [number, number, number],
        scale: model.preview_scale,
      },
      viewer: {
        autoRotate: model.viewer_auto_rotate,
        autoRotateSpeed: model.viewer_auto_rotate_speed,
        cameraPosition: [
          model.viewer_camera_x,
          model.viewer_camera_y,
          model.viewer_camera_z,
        ] as [number, number, number],
      },
    }));
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

// Export default untuk backward compatibility
// Ini akan tetap berisi hardcoded data sebagai fallback
export const models: Model3D[] = [
  {
    id: '1',
    name: 'Maskot FM 11',
    category: 'Character',
    description: 'Futuristic space explorer',
    modelPath: getModelUrl('maskot-fm11.glb'),
    preview: {
      cameraPosition: [0, 1, -2],
      scale: 0.6,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  // ... data lainnya
];

// ============================================
// Update Component: src/components/Catalog.tsx
// ============================================

import { useState, useEffect } from 'react';
import { Model3D } from '../types';
import { fetchModelsFromDatabase, models as fallbackModels } from '../data';
import ModelCard from './ModelCard';

export default function Catalog() {
  const [models, setModels] = useState<Model3D[]>(fallbackModels);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load models dari database saat component mount
  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      setLoading(true);
      const data = await fetchModelsFromDatabase();
      
      if (data.length > 0) {
        setModels(data); // Gunakan data dari database
      } else {
        setModels(fallbackModels); // Fallback ke hardcoded jika error
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModels(fallbackModels); // Fallback
    } finally {
      setLoading(false);
    }
  }

  // Filter by category
  const filteredModels =
    selectedCategory === 'all'
      ? models
      : models.filter((m) => m.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...new Set(models.map((m) => m.category))];

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading models...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="catalog" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">3D Model Catalog</h2>
        <p className="text-center text-gray-600 mb-12">
          Explore our collection of high-quality 3D models
        </p>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            No models found in this category
          </p>
        )}
      </div>
    </section>
  );
}

// ============================================
// Realtime Updates (Optional Advanced Feature)
// ============================================

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook untuk subscribe ke perubahan database realtime
 */
export function useRealtimeModels(onUpdate: () => void) {
  useEffect(() => {
    // Subscribe ke perubahan di tabel models_catalog
    const channel = supabase
      .channel('models-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'models_catalog',
        },
        (payload) => {
          console.log('Database changed:', payload);
          onUpdate(); // Reload data
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

// Usage di component:
// useRealtimeModels(() => {
//   loadModels(); // Reload saat ada perubahan
// });

// ============================================
// Search Feature
// ============================================

import { supabase } from '../lib/supabase';

export async function searchModels(query: string): Promise<Model3D[]> {
  try {
    const { data, error } = await supabase.rpc('search_models', {
      p_search_term: query,
    });

    if (error) throw error;

    return data.map((model: any) => ({
      id: model.id,
      name: model.name,
      category: model.category,
      description: model.description,
      modelPath: getModelUrl(model.model_filename),
      // ... transform lainnya
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Usage di component:
// const [searchResults, setSearchResults] = useState<Model3D[]>([]);
// 
// async function handleSearch(query: string) {
//   const results = await searchModels(query);
//   setSearchResults(results);
// }

// ============================================
// Category Filter with Supabase
// ============================================

export async function getModelsByCategory(category: string): Promise<Model3D[]> {
  try {
    const { data, error } = await supabase.rpc('get_models_catalog', {
      p_category: category,
      p_active_only: true,
    });

    if (error) throw error;

    return data.map((model: any) => ({
      // ... transform
    }));
  } catch (error) {
    console.error('Error fetching by category:', error);
    return [];
  }
}

// ============================================
// Pagination
// ============================================

export async function getModelsPaginated(
  page: number = 1,
  perPage: number = 9
): Promise<Model3D[]> {
  const offset = (page - 1) * perPage;

  try {
    const { data, error } = await supabase.rpc('get_models_catalog', {
      p_active_only: true,
      p_limit: perPage,
      p_offset: offset,
    });

    if (error) throw error;

    return data.map((model: any) => ({
      // ... transform
    }));
  } catch (error) {
    console.error('Pagination error:', error);
    return [];
  }
}

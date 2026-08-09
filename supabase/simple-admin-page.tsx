// ============================================
// SIMPLE ADMIN PAGE - Copy-paste ready
// ============================================
// File: src/pages/AdminPage.tsx
// Halaman admin sederhana untuk CRUD via website

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Model {
  id: string;
  name: string;
  category: string;
  description: string;
  model_filename: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Character',
    description: '',
    file: null as File | null,
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Load models
  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('models_catalog')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal load data');
    } finally {
      setLoading(false);
    }
  }

  // Upload file dan tambah model
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.file) {
      alert('Pilih file GLB dulu!');
      return;
    }

    try {
      setUploading(true);

      // 1. Upload file ke Storage
      const filename = formData.file.name;
      const { error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(filename, formData.file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Tambah ke database
      const { error: dbError } = await supabase.rpc('create_model', {
        p_name: formData.name,
        p_category: formData.category,
        p_description: formData.description,
        p_model_filename: filename,
      });

      if (dbError) throw dbError;

      alert('✅ Model berhasil ditambahkan!');
      setFormData({ name: '', category: 'Character', description: '', file: null });
      loadModels();
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Edit model
  async function handleEdit(id: string) {
    try {
      const { error } = await supabase.rpc('update_model', {
        p_id: id,
        p_name: editForm.name || null,
        p_description: editForm.description || null,
      });

      if (error) throw error;

      alert('✅ Model berhasil diupdate!');
      setEditingId(null);
      loadModels();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  }

  // Delete model (soft delete)
  async function handleDelete(id: string) {
    if (!confirm('Nonaktifkan model ini?')) return;

    try {
      const { error } = await supabase.rpc('deactivate_model', { p_id: id });
      if (error) throw error;

      alert('✅ Model dinonaktifkan');
      loadModels();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  }

  // Activate model
  async function handleActivate(id: string) {
    try {
      const { error } = await supabase.rpc('update_model', {
        p_id: id,
        p_is_active: true,
      });

      if (error) throw error;
      alert('✅ Model diaktifkan');
      loadModels();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Kelola katalog model 3D</p>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Tambah Model Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Model *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., Gubernur Jawa Timur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Character"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Deskripsi model"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File GLB *
              </label>
              <input
                type="file"
                accept=".glb"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              {formData.file && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {uploading ? '⏳ Uploading...' : '✅ Tambah Model'}
            </button>
          </form>
        </div>

        {/* Models List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold">📋 Daftar Model ({models.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.id} className={!model.is_active ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4">
                      {editingId === model.id ? (
                        <input
                          type="text"
                          defaultValue={model.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{model.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{model.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{model.model_filename}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          model.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {model.is_active ? '✓ Aktif' : '✗ Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {editingId === model.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(model.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(model.id);
                              setEditForm({ name: model.name, description: model.description });
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            ✏️ Edit
                          </button>
                          {model.is_active ? (
                            <button
                              onClick={() => handleDelete(model.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              🗑️ Nonaktif
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(model.id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              ✓ Aktifkan
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-500 text-sm">Total Models</div>
            <div className="text-3xl font-bold text-gray-900">{models.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-500 text-sm">Aktif</div>
            <div className="text-3xl font-bold text-green-600">
              {models.filter((m) => m.is_active).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-500 text-sm">Nonaktif</div>
            <div className="text-3xl font-bold text-red-600">
              {models.filter((m) => !m.is_active).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

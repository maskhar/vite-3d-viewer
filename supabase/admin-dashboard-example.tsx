// ============================================
// React Component Example - Admin Dashboard
// ============================================
// File: src/components/AdminDashboard.tsx
// Simple admin dashboard untuk CRUD operations

import { useState, useEffect } from 'react';
import {
  getModelsCatalog,
  createModel,
  updateModel,
  deactivateModel,
  deleteModel,
  uploadModelFile,
  getModelFileUrl,
} from '../services/catalogService';
import type { ModelsCatalogFormatted } from '../types/supabase';

export default function AdminDashboard() {
  const [models, setModels] = useState<ModelsCatalogFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Character',
    description: '',
    model_filename: '',
  });

  // Load models
  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      setLoading(true);
      const data = await getModelsCatalog({ activeOnly: false });
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  // Handle create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createModel({
        p_name: formData.name,
        p_category: formData.category,
        p_description: formData.description,
        p_model_filename: formData.model_filename,
      });
      alert('Model berhasil ditambahkan!');
      setShowAddForm(false);
      setFormData({ name: '', category: 'Character', description: '', model_filename: '' });
      loadModels();
    } catch (error) {
      console.error('Failed to create model:', error);
      alert('Gagal menambahkan model');
    }
  }

  // Handle update
  async function handleUpdate(id: string, updates: Partial<typeof formData>) {
    try {
      await updateModel({
        p_id: id,
        p_name: updates.name,
        p_description: updates.description,
        p_category: updates.category,
      });
      alert('Model berhasil diupdate!');
      setEditingId(null);
      loadModels();
    } catch (error) {
      console.error('Failed to update model:', error);
      alert('Gagal update model');
    }
  }

  // Handle deactivate
  async function handleDeactivate(id: string) {
    if (!confirm('Nonaktifkan model ini?')) return;
    try {
      await deactivateModel(id);
      alert('Model dinonaktifkan');
      loadModels();
    } catch (error) {
      console.error('Failed to deactivate model:', error);
      alert('Gagal nonaktifkan model');
    }
  }

  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm('HAPUS PERMANEN model ini? Tidak bisa dikembalikan!')) return;
    try {
      await deleteModel(id);
      alert('Model dihapus permanen');
      loadModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
      alert('Gagal hapus model');
    }
  }

  // Handle file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filename = file.name;
      await uploadModelFile(file, filename);
      setFormData({ ...formData, model_filename: filename });
      alert('File berhasil diupload!');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Gagal upload file');
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard - Katalog 3D Models</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showAddForm ? 'Batal' : '+ Tambah Model'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Tambah Model Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Model</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload File GLB</label>
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                {formData.model_filename && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ File: {formData.model_filename}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                disabled={!formData.model_filename}
              >
                Simpan Model
              </button>
            </form>
          </div>
        )}

        {/* Models Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
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
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {models.map((model) => (
                <tr key={model.id} className={!model.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {model.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    {editingId === model.id ? (
                      <input
                        type="text"
                        defaultValue={model.name}
                        onBlur={(e) =>
                          handleUpdate(model.id, { name: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium">{model.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{model.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {model.model_filename}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        model.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {model.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{model.display_order}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => setEditingId(model.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(model.id)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Nonaktif
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Models</h3>
            <p className="text-3xl font-bold">{models.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Aktif</h3>
            <p className="text-3xl font-bold text-green-600">
              {models.filter((m) => m.is_active).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Nonaktif</h3>
            <p className="text-3xl font-bold text-red-600">
              {models.filter((m) => !m.is_active).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

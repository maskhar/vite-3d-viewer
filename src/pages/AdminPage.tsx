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
  preview_camera_x: number;
  preview_camera_y: number;
  preview_camera_z: number;
  preview_scale: number;
}

export default function AdminPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state untuk tambah model baru
  const [formData, setFormData] = useState({
    name: '',
    category: 'Character',
    description: '',
    file: null as File | null,
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    description: '', 
    file: null as File | null,
    currentFilename: ''
  });

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    filterModels();
  }, [models, searchTerm, filterCategory, filterStatus]);

  function filterModels() {
    let filtered = [...models];

    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.model_filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(model => model.category === filterCategory);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(model => model.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(model => !model.is_active);
    }

    setFilteredModels(filtered);
  }

  async function loadModels() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('models_catalog')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.file) {
      setMessage({ type: 'error', text: 'Pilih file GLB terlebih dahulu!' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      const filename = formData.file.name;
      const { error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(filename, formData.file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.rpc('create_model', {
        p_name: formData.name,
        p_category: formData.category,
        p_description: formData.description,
        p_model_filename: filename,
      });

      if (dbError) throw dbError;

      setMessage({ type: 'success', text: 'Model berhasil ditambahkan!' });
      setFormData({ name: '', category: 'Character', description: '', file: null });
      setShowAddForm(false);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      loadModels();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editForm.name.trim()) {
      setMessage({ type: 'error', text: 'Nama model tidak boleh kosong!' });
      return;
    }

    try {
      setUploading(true);
      
      let finalFilename = editForm.currentFilename;

      if (editForm.file) {
        const newFilename = editForm.file.name;
        const { error: uploadError } = await supabase.storage
          .from('3d-models')
          .upload(newFilename, editForm.file, { upsert: true });

        if (uploadError) throw uploadError;
        finalFilename = newFilename;
      }

      const { error } = await supabase.rpc('update_model', {
        p_id: id,
        p_name: editForm.name,
        p_description: editForm.description || null,
        p_model_filename: finalFilename,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Model berhasil diupdate!' });
      setEditingId(null);
      setEditForm({ name: '', description: '', file: null, currentFilename: '' });
      loadModels();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Nonaktifkan model "${name}"?`)) return;

    try {
      const { error } = await supabase.rpc('deactivate_model', { p_id: id });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Model dinonaktifkan' });
      setEditingId(null);
      loadModels();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    }
  }

  async function handleActivate(id: string, name: string) {
    try {
      const { error } = await supabase.rpc('update_model', {
        p_id: id,
        p_is_active: true,
      });

      if (error) throw error;
      setMessage({ type: 'success', text: `Model "${name}" diaktifkan` });
      loadModels();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    }
  }

  const categories = ['all', ...Array.from(new Set(models.map(m => m.category)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola koleksi 3D models</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 text-sm sm:text-base ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Add Model Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm sm:text-base font-semibold shadow-lg transition-all"
          >
            {showAddForm ? '? Batal' : '+ Tambah Model Baru'}
          </button>
        </div>

        {/* Add Model Form */}
        {showAddForm && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Tambah Model Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Nama Model</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Masukkan nama model"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="Character">Character</option>
                  <option value="Object">Object</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Masukkan deskripsi model"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">File GLB</label>
                <input
                  type="file"
                  accept=".glb"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Simpan Model'}
              </button>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Filter & Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau file..."
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            Menampilkan <span className="font-bold text-indigo-600">{filteredModels.length}</span> dari <span className="font-bold">{models.length}</span> model
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-indigo-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">Nama</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden md:table-cell">File</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      Tidak ada model yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model) => (
                    <tr 
                      key={model.id} 
                      className={`hover:bg-indigo-50/50 transition-colors ${
                        model.is_active ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {editingId === model.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                              placeholder="Nama model"
                              autoFocus
                            />
                            <div>
                              <label className="block text-[10px] sm:text-xs text-gray-600 mb-1 font-semibold">Update File (opsional)</label>
                              <input
                                type="file"
                                accept=".glb"
                                onChange={(e) => setEditForm({ ...editForm, file: e.target.files?.[0] || null })}
                                className="w-full text-[10px] sm:text-xs text-gray-900 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                              <p className="text-[10px] text-gray-500 mt-1">Current: {editForm.currentFilename}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-xs sm:text-sm text-gray-900 block">{model.name}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 sm:hidden block mt-1">{model.category}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] sm:text-xs font-medium">
                          {model.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-[10px] sm:text-xs text-gray-600 font-mono">
                        {model.model_filename}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                          model.is_active 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {model.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {editingId === model.id ? (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(model.id)}
                              disabled={uploading}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-colors disabled:bg-gray-400"
                            >
                              {uploading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({ name: '', description: '', file: null, currentFilename: '' });
                              }}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 rounded font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            {model.is_active && (
                              <button
                                onClick={() => {
                                  setEditingId(model.id);
                                  setEditForm({ 
                                    name: model.name, 
                                    description: model.description,
                                    file: null,
                                    currentFilename: model.model_filename
                                  });
                                }}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {model.is_active ? (
                              <button
                                onClick={() => handleDelete(model.id, model.name)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition-colors"
                              >
                                Nonaktif
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(model.id, model.name)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-colors"
                              >
                                Aktifkan
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

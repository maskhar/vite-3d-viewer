import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, GripVertical, Home, FolderTree } from 'lucide-react';
import CategoryManager from '../components/CategoryManager';

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

function SortableRow({ model, editingId, editForm, uploading, setEditingId, setEditForm, handleEdit, handleToggleStatus }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${model.is_active ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
    >
      <td className="px-3 sm:px-6 py-3 sm:py-4 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        {editingId === model.id ? (
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full px-2 py-1 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
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
      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
        {editingId === model.id ? (
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs text-gray-600 font-mono">{editForm.currentFilename}</p>
            <input
              type="file"
              accept=".glb"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setEditForm({ ...editForm, file });
                }
              }}
              className="text-[10px] sm:text-xs text-gray-900"
            />
          </div>
        ) : (
          <span className="text-[10px] sm:text-xs text-gray-600 font-mono">{model.model_filename}</span>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        <button
          onClick={() => handleToggleStatus(model.id, !model.is_active)}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer hover:scale-105 ${
            model.is_active 
              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
          }`}
        >
          {model.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
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
          <button
            onClick={() => {
              setEditingId(model.id);
              setEditForm({
                name: model.name,
                description: model.description || '',
                file: null,
                currentFilename: model.model_filename,
              });
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition-colors"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    file: File | null;
    currentFilename: string;
  }>({
    name: '',
    description: '',
    file: null,
    currentFilename: '',
  });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'model/gltf-binary': ['.glb'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleUpload(acceptedFiles[0]);
      }
    },
  });

  useEffect(() => {
    checkAuth();
    loadModels();
    
    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('models_catalog_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'models_catalog'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setModels(prev => [...prev, payload.new as Model]);
          } else if (payload.eventType === 'UPDATE') {
            setModels(prev => prev.map(m => m.id === payload.new.id ? payload.new as Model : m));
          } else if (payload.eventType === 'DELETE') {
            setModels(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = [...models];

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.model_filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) =>
        filterStatus === 'active' ? m.is_active : !m.is_active
      );
    }

    filtered.sort((a, b) => a.display_order - b.display_order);
    setFilteredModels(filtered);
  }, [models, searchQuery, filterCategory, filterStatus]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredModels.findIndex((m) => m.id === active.id);
      const newIndex = filteredModels.findIndex((m) => m.id === over.id);

      const reorderedModels = arrayMove(filteredModels, oldIndex, newIndex);
      
      // OPTIMISTIC UPDATE: Update UI immediately
      setFilteredModels(reorderedModels);
      setModels(prev => {
        const newModels = [...prev];
        const oldIdx = newModels.findIndex(m => m.id === active.id);
        const newIdx = newModels.findIndex(m => m.id === over.id);
        return arrayMove(newModels, oldIdx, newIdx);
      });

      try {
        // Update display_order in database
        const updates = reorderedModels.map((model, index) => ({
          id: model.id,
          display_order: index,
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('models_catalog')
            .update({ display_order: update.display_order })
            .eq('id', update.id);

          if (error) throw error;
        }

        setMessage({ type: 'success', text: 'Urutan berhasil diperbarui!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        console.error('Error updating order:', error);
        setMessage({ type: 'error', text: 'Gagal memperbarui urutan: ' + error.message });
        // Revert on error
        loadModels();
      }
    }
  }

  async function handleToggleStatus(id: string, newStatus: boolean) {
    // OPTIMISTIC UPDATE: Update UI immediately
    setModels(prev => prev.map(m => m.id === id ? { ...m, is_active: newStatus } : m));
    setFilteredModels(prev => prev.map(m => m.id === id ? { ...m, is_active: newStatus } : m));

    try {
      const { error } = await supabase
        .from('models_catalog')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Status berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}!` 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal mengubah status: ' + error.message });
      // Revert on error
      loadModels();
    }
  }

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      setMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const maxOrder = Math.max(...models.map((m) => m.display_order), -1);

      const { error: insertError } = await supabase.from('models_catalog').insert({
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Character',
        description: '',
        model_filename: fileName,
        is_active: true,
        display_order: maxOrder + 1,
      });

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'Model berhasil diunggah!' });
      await loadModels();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal mengunggah model: ' + error.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleEdit(id: string) {
    try {
      setUploading(true);
      setMessage(null);

      let fileName = editForm.currentFilename;

      if (editForm.file) {
        const fileExt = editForm.file.name.split('.').pop();
        fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('3d-models')
          .upload(fileName, editForm.file);

        if (uploadError) throw uploadError;

        const model = models.find((m) => m.id === id);
        if (model?.model_filename) {
          await supabase.storage.from('3d-models').remove([model.model_filename]);
        }
      }

      const { error: updateError } = await supabase
        .from('models_catalog')
        .update({
          name: editForm.name,
          description: editForm.description,
          model_filename: fileName,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Model berhasil diperbarui!' });
      setEditingId(null);
      setEditForm({ name: '', description: '', file: null, currentFilename: '' });
      await loadModels();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui model: ' + error.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <>
    {showCategoryManager ? (
      <CategoryManager onClose={() => setShowCategoryManager(false)} />
    ) : (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1 sm:mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">Kelola koleksi model 3D Anda</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm font-semibold"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              Kembali ke Home
            </button>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm font-semibold"
            >
              <FolderTree className="w-3 h-3 sm:w-4 sm:h-4" />
              Kelola Kategori
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl shadow-lg text-xs sm:text-sm font-semibold ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8 border-2 border-gray-200">
          <h2 className="text-lg sm:text-2xl font-black text-gray-800 mb-3 sm:mb-6">Tambah Model Baru</h2>
          <div
            {...getRootProps()}
            className={`border-4 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-indigo-600" />
            <p className="text-xs sm:text-lg font-bold text-gray-700 mb-1 sm:mb-2">
              {isDragActive ? 'Lepaskan file di sini' : 'Drag & drop file GLB atau klik untuk upload'}
            </p>
            <p className="text-[10px] sm:text-sm text-gray-500">Format: .glb</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-8 border-2 border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">Cari</label>
              <input
                type="text"
                placeholder="Cari nama atau file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              >
                <option value="all">Semua Kategori</option>
                <option value="Character">Character</option>
                <option value="Object">Object</option>
                <option value="Environment">Environment</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Urutan
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:table-cell">
                    Kategori
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden md:table-cell">
                    File
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-4 sm:py-8 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-4 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredModels.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredModels.map((model) => (
                        <SortableRow
                          key={model.id}
                          model={model}
                          editingId={editingId}
                          editForm={editForm}
                          uploading={uploading}
                          setEditingId={setEditingId}
                          setEditForm={setEditForm}
                          handleEdit={handleEdit}
                          handleToggleStatus={handleToggleStatus}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    )}
    </>
  );
}

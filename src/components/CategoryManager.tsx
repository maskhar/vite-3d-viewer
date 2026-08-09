import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
import { GripVertical, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryManagerProps {
  onClose: () => void;
}

function SortableCategoryRow({ category, onEdit, onDelete, onToggle, isUsed }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${category.is_active ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
    >
      <td className="px-4 py-3 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 text-gray-400" />
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="font-semibold text-sm text-gray-900 block">{category.name}</span>
          {category.description && (
            <span className="text-xs text-gray-500 block mt-1">{category.description}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggle(category.id, !category.is_active)}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer hover:scale-105 ${
            category.is_active 
              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
          }`}
        >
          {category.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id, category.name)}
            disabled={isUsed}
            className={`p-2 rounded transition-colors ${
              isUsed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isUsed ? 'Kategori sedang digunakan' : 'Hapus'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [usedCategories, setUsedCategories] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
    loadUsedCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function loadCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal memuat kategori: ' + error.message });
    } finally {
      setLoading(false);
    }
  }

  async function loadUsedCategories() {
    try {
      const { data, error } = await supabase
        .from('models_catalog')
        .select('category');

      if (error) throw error;
      
      const used = new Set(data?.map((m: any) => m.category) || []);
      setUsedCategories(used);
    } catch (error: any) {
      console.error('Error loading used categories:', error);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(reorderedCategories);

      try {
        const updates = reorderedCategories.map((cat, index) => ({
          id: cat.id,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        setMessage({ type: 'success', text: 'Urutan kategori berhasil diperbarui!' });
      } catch (error: any) {
        console.error('Error updating order:', error);
        setMessage({ type: 'error', text: 'Gagal memperbarui urutan: ' + error.message });
        loadCategories();
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Nama kategori tidak boleh kosong!' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      if (editingId) {
        // Update existing category
        const { error } = await supabase.rpc('update_category', {
          p_id: editingId,
          p_name: formData.name,
          p_description: formData.description || null,
        });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Kategori berhasil diupdate!' });
      } else {
        // Create new category
        const { error } = await supabase.rpc('create_category', {
          p_name: formData.name,
          p_description: formData.description || null,
        });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Kategori berhasil ditambahkan!' });
      }

      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      loadCategories();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(id: string, newStatus: boolean) {
    try {
      const { error } = await supabase.rpc('toggle_category_status', {
        p_id: id,
        p_is_active: newStatus,
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Kategori berhasil di${newStatus ? 'aktifkan' : 'nonaktifkan'}!` 
      });
      loadCategories();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Gagal mengubah status: ' + error.message });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Pastikan tidak ada model yang menggunakan kategori ini.`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_category', {
        p_id: id,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Kategori berhasil dihapus!' });
      loadCategories();
      loadUsedCategories();
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowForm(true);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowForm(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Kelola Kategori</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Message Alert */}
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            {showForm ? (
              <>
                <X className="w-5 h-5" />
                Batal
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Tambah Kategori Baru
              </>
            )}
          </button>

          {/* Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                    required
                    placeholder="Contoh: Kendaraan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                    rows={3}
                    placeholder="Deskripsi singkat tentang kategori ini"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-bold transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-16">
                    Urutan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Nama & Deskripsi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada kategori
                    </td>
                  </tr>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={categories.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {categories.map((category) => (
                        <SortableCategoryRow
                          key={category.id}
                          category={category}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggle={handleToggleStatus}
                          isUsed={usedCategories.has(category.name)}
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
  );
}

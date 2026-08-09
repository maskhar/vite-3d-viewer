# 📦 Supabase Dashboard CRUD - Complete Package

Complete SQL schema, CRUD functions, and integration guide untuk dashboard admin katalog 3D models.

---

## 📁 Struktur File

```
supabase/
├── README.md                           # Dokumentasi lengkap (baca ini!)
├── SETUP_CHECKLIST.md                  # Checklist step-by-step setup
├── 01_schema_and_data.sql              # ⭐ Schema database & sample data
├── 02_crud_functions.sql               # ⭐ Stored procedures CRUD
├── 03_quick_queries.sql                # Quick reference queries
├── typescript-integration.ts           # Types & service functions
├── admin-dashboard-example.tsx         # React admin component
└── frontend-integration-guide.ts       # Integrasi dengan frontend existing
```

---

## 🚀 Quick Start (3 Langkah)

### 1️⃣ Jalankan SQL di Supabase Dashboard

**Login:** https://supabase.carubra.com  
**SQL Editor** → **New Query**

**a. Schema & Data:**
```bash
# Copy file: 01_schema_and_data.sql
# Paste ke SQL Editor → Run
```

**b. CRUD Functions:**
```bash
# Copy file: 02_crud_functions.sql  
# Paste ke SQL Editor → Run
```

### 2️⃣ Upload Files ke Storage

**Storage** → **3d-models** bucket → **Upload files**

Upload semua file `.glb` dari `public/models/`

### 3️⃣ Test

```sql
-- Verifikasi data
SELECT * FROM public.models_catalog;

-- Test function
SELECT * FROM get_models_catalog(p_active_only := true);
```

✅ **Done!** Database siap digunakan.

---

## 📚 File Details

### 1. `01_schema_and_data.sql` ⭐ **WAJIB**

**Isi:**
- ✅ CREATE TABLE `models_catalog`
- ✅ Indexes untuk performa
- ✅ Auto-update timestamp trigger
- ✅ Row Level Security (RLS) policies
- ✅ Sample data (7 models existing)
- ✅ Helper view `models_catalog_formatted`

**Jalankan:** Pertama kali setup

---

### 2. `02_crud_functions.sql` ⭐ **WAJIB**

**Isi:**
- ✅ `get_models_catalog()` - Read dengan filter
- ✅ `get_model_by_id()` - Read single
- ✅ `create_model()` - Create new
- ✅ `update_model()` - Update existing
- ✅ `deactivate_model()` - Soft delete
- ✅ `delete_model()` - Hard delete
- ✅ `update_display_orders()` - Batch update urutan
- ✅ `get_categories()` - Get kategori
- ✅ `search_models()` - Search functionality

**Jalankan:** Setelah schema

---

### 3. `03_quick_queries.sql` 📖 **REFERENCE**

**Isi:**
- Copy-paste queries untuk operasi sehari-hari
- Template dengan placeholder
- Tips & tricks
- Troubleshooting queries

**Penggunaan:** Simpan sebagai referensi, tidak perlu dijalankan

---

### 4. `README.md` 📖 **DOKUMENTASI**

**Isi:**
- Penjelasan lengkap struktur database
- Tutorial CRUD operations
- Use cases praktis
- Troubleshooting guide
- Integration examples

**Baca:** Untuk memahami sistem secara lengkap

---

### 5. `SETUP_CHECKLIST.md` ✅ **PANDUAN**

**Isi:**
- Checklist langkah demi langkah
- Pre-requisites
- Verification steps
- Success criteria
- Daily operations quick ref
- Troubleshooting

**Gunakan:** Saat setup pertama kali

---

### 6. `typescript-integration.ts` 💻 **CODE**

**Isi:**
- TypeScript types untuk Supabase
- Service functions (catalogService)
- Type-safe CRUD operations
- Storage helper functions

**Implementasi:**
```bash
# Split jadi 2 file:
src/types/supabase.ts          # Types
src/services/catalogService.ts # Functions
```

---

### 7. `admin-dashboard-example.tsx` 💻 **CODE**

**Isi:**
- React component lengkap
- Admin dashboard UI
- CRUD operations
- File upload
- Statistics display

**Implementasi:**
```bash
# Copy ke project:
src/components/AdminDashboard.tsx
```

---

### 8. `frontend-integration-guide.ts` 💻 **CODE**

**Isi:**
- Cara integrasi dengan frontend existing
- Update `src/data.ts` untuk fetch dari Supabase
- Update `src/components/Catalog.tsx`
- Realtime updates (optional)
- Search & filter examples
- Pagination

**Gunakan:** Sebagai reference untuk update component

---

## 🎯 Use Cases

### Use Case 1: Setup dari Nol
1. ✅ Jalankan `01_schema_and_data.sql`
2. ✅ Jalankan `02_crud_functions.sql`
3. ✅ Upload files ke Storage
4. ✅ Test dengan `03_quick_queries.sql`

**Time:** ~10 menit

---

### Use Case 2: Tambah Model Baru (Daily)

**Via SQL:**
```sql
-- Upload file.glb ke Storage dulu
SELECT create_model(
  'Nama Model',
  'Character',
  'Deskripsi',
  'filename.glb'
);
```

**Via Admin Dashboard:**
1. Upload file GLB
2. Isi form
3. Klik Save

**Time:** ~2 menit

---

### Use Case 3: Edit Model

```sql
-- Cari UUID
SELECT id, name FROM public.models_catalog 
WHERE name LIKE '%keyword%';

-- Update
SELECT update_model(
  'uuid-here'::UUID,
  p_name := 'New Name',
  p_description := 'New desc'
);
```

**Time:** ~1 menit

---

### Use Case 4: Ganti Urutan

```sql
-- Lihat urutan saat ini
SELECT id, name, display_order FROM public.models_catalog 
ORDER BY display_order;

-- Update batch
SELECT update_display_orders('[
  {"id": "uuid-1", "order": 1},
  {"id": "uuid-2", "order": 2}
]'::JSONB);
```

**Time:** ~2 menit

---

## 🔥 Most Used Queries

### Lihat Semua Model
```sql
SELECT * FROM public.models_catalog ORDER BY display_order;
```

### Tambah Model
```sql
SELECT create_model('Name', 'Category', 'Desc', 'file.glb');
```

### Edit Model
```sql
SELECT update_model('uuid'::UUID, p_name := 'New Name');
```

### Nonaktifkan
```sql
SELECT deactivate_model('uuid'::UUID);
```

### Search
```sql
SELECT * FROM search_models('keyword');
```

---

## 🛠️ Tech Stack

- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Security:** Row Level Security (RLS)
- **Frontend:** React + TypeScript
- **API:** Supabase RPC Functions

---

## 📊 Database Schema Overview

### Table: `models_catalog`

**Columns:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Nama model
- `category` (VARCHAR) - Kategori
- `description` (TEXT) - Deskripsi
- `model_filename` (VARCHAR) - Nama file di storage
- `preview_camera_x/y/z` (DECIMAL) - Posisi kamera preview
- `preview_rotation_x/y/z` (DECIMAL) - Rotasi preview
- `preview_scale` (DECIMAL) - Scale preview
- `viewer_auto_rotate` (BOOLEAN) - Auto rotate
- `viewer_auto_rotate_speed` (DECIMAL) - Speed
- `viewer_camera_x/y/z` (DECIMAL) - Posisi kamera viewer
- `is_active` (BOOLEAN) - Status
- `display_order` (INTEGER) - Urutan tampilan
- `created_at` (TIMESTAMPTZ) - Created timestamp
- `updated_at` (TIMESTAMPTZ) - Updated timestamp

**Indexes:**
- Category, Active status, Display order

---

## 🔐 Security

### RLS Policies Applied:

1. **Public Read Active** - Public bisa lihat model aktif
2. **Authenticated Read All** - User login bisa lihat semua
3. **Authenticated Write** - User login bisa CRUD

### Storage Policy:

- Bucket `3d-models` set sebagai **PUBLIC**
- Anyone can READ files
- Only authenticated can UPLOAD/DELETE

---

## 🎓 Learning Path

**Beginner:**
1. Baca `SETUP_CHECKLIST.md`
2. Jalankan SQL files
3. Test dengan `03_quick_queries.sql`

**Intermediate:**
1. Baca `README.md`
2. Implement `typescript-integration.ts`
3. Test CRUD via code

**Advanced:**
1. Implement `admin-dashboard-example.tsx`
2. Add realtime updates
3. Custom features

---

## 📞 Support & Resources

**Dokumentasi:**
- `README.md` - Dokumentasi lengkap
- `SETUP_CHECKLIST.md` - Step-by-step guide

**Supabase:**
- Dashboard: https://supabase.carubra.com
- Docs: https://supabase.com/docs

**Files:**
- All SQL files included
- TypeScript examples included
- React component example included

---

## ✅ Success Checklist

Setup berhasil jika:

- [ ] Table `models_catalog` ada dan berisi 7 rows
- [ ] All functions bisa dijalankan tanpa error
- [ ] File GLB bisa diakses via URL
- [ ] Query `SELECT * FROM get_models_catalog()` works
- [ ] Website menampilkan models dari database
- [ ] Bisa tambah model baru
- [ ] Bisa edit dan hapus model

---

## 🚧 Next Steps

1. **Setup database** menggunakan SQL files
2. **Test CRUD** dengan quick queries
3. **Integrate frontend** menggunakan TypeScript service
4. **Optional: Build admin dashboard** dengan React component
5. **Deploy** dan monitor

---

## 📝 Notes

- Semua SQL sudah production-ready
- RLS policies sudah dikonfigurasi
- Sample data included
- Full TypeScript typing
- Responsive React component
- Realtime updates supported

---

**Package Version:** 1.0.0  
**Created:** 2026-08-09  
**Author:** Kiro AI Assistant  
**Project:** webiste-3d-models

---

## 🎉 Ready to Go!

Semua file sudah siap. Tinggal:
1. Jalankan SQL di Supabase
2. Upload files ke Storage
3. Enjoy! 🚀

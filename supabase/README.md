# 📊 Supabase Dashboard CRUD - Panduan Lengkap

Dokumentasi lengkap untuk setup dan menggunakan dashboard CRUD katalog model 3D di Supabase.

---

## 📁 File SQL yang Tersedia

1. **`01_schema_and_data.sql`** - Schema database, RLS policies, dan sample data
2. **`02_crud_functions.sql`** - Stored procedures untuk operasi CRUD

---

## 🚀 Langkah-langkah Setup

### 1. Login ke Supabase Dashboard
Buka: **https://supabase.carubra.com**

### 2. Buka SQL Editor
- Klik **SQL Editor** di sidebar kiri
- Klik **New Query**

### 3. Jalankan Schema SQL
- Copy semua isi file `01_schema_and_data.sql`
- Paste ke SQL Editor
- Klik **Run** atau tekan `Ctrl + Enter`
- Tunggu sampai selesai (akan muncul "Success")

### 4. Jalankan CRUD Functions SQL
- Buat query baru lagi
- Copy semua isi file `02_crud_functions.sql`
- Paste ke SQL Editor
- Klik **Run**

### 5. Verifikasi Setup
Jalankan query berikut untuk memastikan semua berhasil:

```sql
-- Cek jumlah data
SELECT COUNT(*) FROM public.models_catalog;

-- Lihat semua data
SELECT * FROM public.models_catalog ORDER BY display_order;
```

---

## 📋 Struktur Database

### Tabel: `models_catalog`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | VARCHAR(255) | Nama model |
| `category` | VARCHAR(100) | Kategori (e.g., "Character") |
| `description` | TEXT | Deskripsi model |
| `model_filename` | VARCHAR(255) | Nama file GLB di storage |
| `preview_camera_x/y/z` | DECIMAL | Posisi kamera preview |
| `preview_rotation_x/y/z` | DECIMAL | Rotasi preview |
| `preview_scale` | DECIMAL | Skala preview |
| `viewer_auto_rotate` | BOOLEAN | Auto rotate di viewer |
| `viewer_auto_rotate_speed` | DECIMAL | Kecepatan rotasi |
| `viewer_camera_x/y/z` | DECIMAL | Posisi kamera viewer |
| `is_active` | BOOLEAN | Status aktif/nonaktif |
| `display_order` | INTEGER | Urutan tampilan |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu update terakhir |

---

## 🔐 Row Level Security (RLS)

### Policies yang Diterapkan:

1. **Public Read** - Siapa saja bisa lihat model yang `is_active = true`
2. **Authenticated Read** - User login bisa lihat semua model
3. **Authenticated Write** - User login bisa INSERT, UPDATE, DELETE

### Cara Tambah Admin User:
```sql
-- Cek user yang sudah terdaftar
SELECT id, email, role FROM auth.users;

-- Atau buat user baru via Dashboard:
-- Authentication > Users > Invite User
```

---

## 🛠️ CRUD Operations

### 1️⃣ **CREATE** - Tambah Model Baru

```sql
SELECT create_model(
  'Nama Model',                    -- name
  'Character',                      -- category
  'Deskripsi model ini',           -- description
  'nama-file.glb',                 -- model_filename
  0,                               -- preview_camera_x (optional)
  1,                               -- preview_camera_y (optional)
  7,                               -- preview_camera_z (optional)
  2,                               -- preview_scale (optional)
  false,                           -- viewer_auto_rotate (optional)
  8                                -- display_order (optional)
);
```

**Contoh Praktis:**
```sql
SELECT create_model(
  'Gubernur Jawa Timur',
  'Character',
  'Miniatur Gubernur Jawa Timur',
  'gubernur-jatim.glb'
);
```

---

### 2️⃣ **READ** - Lihat Data

#### a. Lihat Semua Model Aktif
```sql
SELECT * FROM get_models_catalog(p_active_only := true);
```

#### b. Lihat Berdasarkan Kategori
```sql
SELECT * FROM get_models_catalog(p_category := 'Character');
```

#### c. Lihat Model Spesifik
```sql
SELECT * FROM get_model_by_id('uuid-model-disini'::UUID);
```

#### d. Search Model
```sql
SELECT * FROM search_models('Malang');
```

#### e. Lihat Semua Kategori
```sql
SELECT * FROM get_categories();
```

#### f. Query Manual (Tanpa Function)
```sql
-- Lihat semua
SELECT * FROM public.models_catalog 
ORDER BY display_order;

-- Lihat aktif saja
SELECT * FROM public.models_catalog 
WHERE is_active = true 
ORDER BY display_order;

-- Lihat dengan format JSON
SELECT * FROM public.models_catalog_formatted;
```

---

### 3️⃣ **UPDATE** - Edit Model

#### a. Update Nama dan Deskripsi
```sql
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_name := 'Nama Baru',
  p_description := 'Deskripsi baru'
);
```

#### b. Update Posisi Kamera
```sql
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_preview_camera_x := 0,
  p_preview_camera_y := 2,
  p_preview_camera_z := 8,
  p_preview_scale := 1.5
);
```

#### c. Update Display Order
```sql
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_display_order := 1
);
```

#### d. Aktivasi/Deaktivasi Model
```sql
-- Nonaktifkan
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_is_active := false
);

-- Aktifkan
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_is_active := true
);
```

#### e. Update Manual (Tanpa Function)
```sql
UPDATE public.models_catalog 
SET 
  name = 'Nama Baru',
  description = 'Deskripsi baru',
  preview_scale = 1.5
WHERE id = 'uuid-model-disini';
```

---

### 4️⃣ **DELETE** - Hapus Model

#### a. Soft Delete (Recommended)
```sql
-- Hanya nonaktifkan, data tetap ada
SELECT deactivate_model('uuid-model-disini'::UUID);
```

#### b. Hard Delete (Permanent)
```sql
-- Hapus permanen dari database
SELECT delete_model('uuid-model-disini'::UUID);
```

#### c. Delete Manual
```sql
-- Soft delete
UPDATE public.models_catalog 
SET is_active = false 
WHERE id = 'uuid-model-disini';

-- Hard delete
DELETE FROM public.models_catalog 
WHERE id = 'uuid-model-disini';
```

---

### 5️⃣ **BATCH Operations**

#### a. Bulk Update Display Order
```sql
SELECT update_display_orders('[
  {"id": "uuid-1", "order": 1},
  {"id": "uuid-2", "order": 2},
  {"id": "uuid-3", "order": 3}
]'::JSONB);
```

#### b. Bulk Activate/Deactivate
```sql
-- Aktifkan semua Character
UPDATE public.models_catalog 
SET is_active = true 
WHERE category = 'Character';

-- Nonaktifkan semua kecuali 3 teratas
UPDATE public.models_catalog 
SET is_active = false 
WHERE display_order > 3;
```

---

## 🎯 Use Cases Praktis

### Scenario 1: Upload Model Baru ke Storage dan Tambah ke Database

**Step 1:** Upload file GLB ke Supabase Storage
- Buka **Storage** > `3d-models` bucket
- Upload file `new-model.glb`

**Step 2:** Tambah ke database
```sql
SELECT create_model(
  'Model Baru Saya',
  'Character',
  'Deskripsi model baru',
  'new-model.glb',
  0, 1, 7, 2, false, 999
);
```

---

### Scenario 2: Ganti Urutan Tampilan Model

```sql
-- Lihat urutan saat ini
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;

-- Update urutan
SELECT update_display_orders('[
  {"id": "uuid-model-1", "order": 1},
  {"id": "uuid-model-2", "order": 2},
  {"id": "uuid-model-3", "order": 3}
]'::JSONB);
```

---

### Scenario 3: Ganti Nama File Model yang Sudah Ada

**Step 1:** Upload file baru ke Storage dengan nama baru

**Step 2:** Update database
```sql
SELECT update_model(
  'uuid-model-disini'::UUID,
  p_model_filename := 'nama-file-baru.glb'
);
```

**Step 3:** Hapus file lama dari Storage (optional)

---

### Scenario 4: Clone/Duplicate Model

```sql
-- Ambil data model yang mau di-clone
WITH source AS (
  SELECT * FROM public.models_catalog 
  WHERE id = 'uuid-model-asli'::UUID
)
INSERT INTO public.models_catalog (
  name, category, description, model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate, display_order
)
SELECT 
  name || ' (Copy)',
  category,
  description,
  model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate,
  display_order + 1
FROM source;
```

---

## 🔍 Useful Queries untuk Dashboard

### Dashboard Stats
```sql
-- Total models
SELECT COUNT(*) as total FROM public.models_catalog;

-- Active vs Inactive
SELECT 
  is_active,
  COUNT(*) as count
FROM public.models_catalog
GROUP BY is_active;

-- Models per category
SELECT 
  category,
  COUNT(*) as count
FROM public.models_catalog
GROUP BY category
ORDER BY count DESC;

-- Recent additions (last 7 days)
SELECT name, created_at 
FROM public.models_catalog 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Error: "permission denied for table models_catalog"
**Solusi:** Pastikan RLS policies sudah dibuat dengan benar. Jalankan ulang bagian policies dari `01_schema_and_data.sql`

### Error: "function does not exist"
**Solusi:** Jalankan ulang `02_crud_functions.sql`

### Model tidak muncul di frontend
**Solusi:** 
1. Cek `is_active = true`
2. Cek file GLB ada di Storage
3. Cek `model_filename` sudah benar

### Data tidak ter-update
**Solusi:** Cek apakah UUID yang digunakan benar:
```sql
-- Cari UUID berdasarkan nama
SELECT id, name FROM public.models_catalog WHERE name LIKE '%keyword%';
```

---

## 📱 Integrasi dengan Frontend

Setelah setup database, kamu bisa fetch data dari frontend:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Fetch active models
export async function getActiveModels() {
  const { data, error } = await supabase
    .rpc('get_models_catalog', { p_active_only: true });
  
  if (error) throw error;
  return data;
}

// Create new model
export async function createModel(modelData: any) {
  const { data, error } = await supabase
    .rpc('create_model', modelData);
  
  if (error) throw error;
  return data;
}
```

---

## ✅ Checklist Setup

- [ ] Jalankan `01_schema_and_data.sql` di SQL Editor
- [ ] Jalankan `02_crud_functions.sql` di SQL Editor
- [ ] Verifikasi data dengan `SELECT * FROM public.models_catalog`
- [ ] Upload semua file GLB ke Storage bucket `3d-models`
- [ ] Test read data: `SELECT * FROM get_models_catalog()`
- [ ] Test create: Tambah 1 model baru
- [ ] Test update: Edit nama model
- [ ] Test delete: Soft delete 1 model
- [ ] Integrasi dengan frontend

---

## 📚 Resources

- [Supabase Dashboard](https://supabase.carubra.com)
- [Supabase Docs - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Docs - Storage](https://supabase.com/docs/guides/storage)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**Dibuat untuk:** webiste-3d-models project  
**Tanggal:** 2026-08-09  
**Author:** Kiro AI Assistant

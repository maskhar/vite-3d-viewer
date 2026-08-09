# 🚀 Setup Checklist - Langkah demi Langkah

## ✅ PRE-REQUISITES

- [X] Akses ke Supabase Dashboard: https://supabase.carubra.com
- [X] Storage bucket `3d-models` sudah dibuat dan set sebagai public
- [X] File `.env` sudah berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

---

## 📝 STEP 1: Setup Database Schema

### 1.1 Buka SQL Editor

1. Login ke Supabase Dashboard
2. Klik **SQL Editor** di sidebar
3. Klik **New Query**

### 1.2 Jalankan Schema SQL

1. Buka file: `supabase/01_schema_and_data.sql`
2. **Copy semua isinya** (Ctrl+A, Ctrl+C)
3. **Paste** ke SQL Editor
4. Klik **Run** (atau tekan Ctrl+Enter)
5. Tunggu sampai muncul "Success" ✅

**Expected Output:**

```
Success. No rows returned.
```

### 1.3 Verifikasi

Jalankan query ini untuk memastikan tabel sudah dibuat:

```sql
SELECT COUNT(*) as total_rows FROM public.models_catalog;
```

**Expected Output:** `total_rows: 7` (dari sample data)

---

## 📝 STEP 2: Install CRUD Functions

### 2.1 Buka Query Baru

- Klik **New Query** lagi di SQL Editor

### 2.2 Jalankan Functions SQL

1. Buka file: `supabase/02_crud_functions.sql`
2. **Copy semua isinya**
3. **Paste** ke SQL Editor
4. Klik **Run**
5. Tunggu "Success" ✅

### 2.3 Verifikasi Functions

Jalankan query ini:

```sql
SELECT * FROM get_models_catalog(p_active_only := true);
```

**Expected Output:** Semua 7 model dalam format JSON

---

## 📝 STEP 3: Test CRUD Operations

### 3.1 Test READ

```sql
-- Lihat semua model
SELECT id, name, category, is_active 
FROM public.models_catalog 
ORDER BY display_order;
```

### 3.2 Test CREATE

```sql
-- Tambah model test
SELECT create_model(
  'Test Model',
  'Character',
  'Model untuk testing',
  'test.glb'
);
```

**Expected Output:** UUID dari model baru

### 3.3 Test UPDATE

```sql
-- Update model yang baru dibuat (ganti UUID dengan hasil dari CREATE)
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_name := 'Test Model (Updated)',
  p_description := 'Deskripsi sudah diupdate'
);
```

**Expected Output:** `true`

### 3.4 Test DELETE

```sql
-- Soft delete model test
SELECT deactivate_model('PASTE_UUID_DISINI'::UUID);
```

**Expected Output:** `true`

### 3.5 Cleanup Test

```sql
-- Hapus model test (hard delete)
SELECT delete_model('PASTE_UUID_DISINI'::UUID);
```

---

## 📝 STEP 4: Upload Files ke Storage

### 4.1 Siapkan File GLB

Pastikan kamu punya file-file ini:

- [ ] maskot-fm11.glb
- [ ] Wali Kota Malang - Full Badan.glb
- [ ] miniatur- (1).glb
- [ ] miniatur- (2).glb
- [ ] miniatur- (3).glb
- [ ] miniatur- (4).glb
- [ ] miniatur- (5).glb

### 4.2 Upload ke Supabase Storage

1. Buka **Storage** di Supabase Dashboard
2. Klik bucket `3d-models`
3. Klik **Upload file**
4. Upload semua file GLB **dengan nama yang sama persis**

### 4.3 Verifikasi Upload

Cek di browser apakah file bisa diakses:

```
https://supabase.carubra.com/storage/v1/object/public/3d-models/maskot-fm11.glb
```

---

## 📝 STEP 5: Test dari Frontend

### 5.1 Update Environment Variables

Pastikan `.env` sudah benar:

```env
VITE_SUPABASE_URL=https://supabase.carubra.com
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5.2 Install Supabase Client (jika belum)

```bash
npm install @supabase/supabase-js
```

### 5.3 Test Fetch Data

Buat file test atau buka console browser:

```javascript
import { supabase } from './lib/supabase';

// Test fetch
const { data, error } = await supabase
  .rpc('get_models_catalog', { p_active_only: true });

console.log('Models:', data);
```

### 5.4 Jalankan Dev Server

```bash
npm run dev
```

Buka browser dan pastikan model-model muncul di katalog.

---

## 📝 STEP 6: Setup Admin Dashboard (Optional)

### 6.1 Copy TypeScript Files

1. Copy `supabase/typescript-integration.ts` content
2. Split menjadi:
   - `src/types/supabase.ts` (bagian types)
   - `src/services/catalogService.ts` (bagian service functions)

### 6.2 Copy Admin Component

1. Copy `supabase/admin-dashboard-example.tsx`
2. Paste ke `src/components/AdminDashboard.tsx`

### 6.3 Add Route (jika pakai React Router)

```tsx
import AdminDashboard from './components/AdminDashboard';

// Di routes
<Route path="/admin" element={<AdminDashboard />} />
```

### 6.4 Test Admin Dashboard

1. Buka `http://localhost:5173/admin`
2. Test tambah, edit, hapus model
3. Test upload file GLB

---

## 🎯 DAILY OPERATIONS - Quick Reference

### Tambah Model Baru

**Step 1:** Upload file GLB ke Storage

- Storage > 3d-models > Upload file

**Step 2:** Tambah ke database via SQL Editor

```sql
SELECT create_model(
  'Nama Model Baru',
  'Character',
  'Deskripsi',
  'nama-file-baru.glb'
);
```

**Step 3:** Refresh website untuk lihat hasilnya

---

### Edit Model Existing

**Step 1:** Cari UUID model

```sql
SELECT id, name FROM public.models_catalog 
WHERE name LIKE '%keyword%';
```

**Step 2:** Update

```sql
SELECT update_model(
  'uuid-disini'::UUID,
  p_name := 'Nama Baru',
  p_description := 'Deskripsi Baru'
);
```

---

### Ganti File GLB

**Step 1:** Upload file baru ke Storage dengan nama berbeda

**Step 2:** Update referensi

```sql
SELECT update_model(
  'uuid-disini'::UUID,
  p_model_filename := 'nama-file-baru.glb'
);
```

**Step 3:** Hapus file lama dari Storage (optional)

---

### Ubah Urutan Tampilan

**Step 1:** Lihat urutan saat ini

```sql
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;
```

**Step 2:** Update urutan

```sql
SELECT update_model(
  'uuid-disini'::UUID,
  p_display_order := 1
);
```

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "permission denied for table models_catalog"

**Solusi:**

1. Pastikan RLS policies sudah dibuat
2. Jalankan ulang bagian policies dari `01_schema_and_data.sql`
3. Atau disable RLS sementara (TIDAK RECOMMENDED untuk production):
   ```sql
   ALTER TABLE public.models_catalog DISABLE ROW LEVEL SECURITY;
   ```

---

### ❌ Error: "function get_models_catalog does not exist"

**Solusi:**

1. Jalankan ulang `02_crud_functions.sql`
2. Pastikan tidak ada error saat menjalankan SQL

---

### ❌ Model tidak muncul di website

**Checklist:**

- [ ] `is_active = true`?
  ```sql
  SELECT is_active FROM public.models_catalog WHERE id = 'uuid-disini';
  ```
- [ ] File GLB ada di Storage?
  - Buka: `https://supabase.carubra.com/storage/v1/object/public/3d-models/filename.glb`
- [ ] Nama file cocok dengan database?
  ```sql
  SELECT model_filename FROM public.models_catalog WHERE id = 'uuid-disini';
  ```

---

### ❌ Upload file gagal

**Solusi:**

1. Cek quota storage di Supabase
2. Cek ukuran file (max 50MB untuk free tier)
3. Pastikan bucket `3d-models` sudah public
4. Cek CORS policy di Storage settings

---

### ❌ UUID tidak ketemu

**Solusi:**
Gunakan query search:

```sql
-- Cari by name
SELECT id, name FROM public.models_catalog 
WHERE name ILIKE '%keyword%';

-- Lihat semua
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;
```

---

## 📊 MONITORING & MAINTENANCE

### Check Database Stats

```sql
-- Total models
SELECT COUNT(*) FROM public.models_catalog;

-- Active vs Inactive
SELECT is_active, COUNT(*) 
FROM public.models_catalog 
GROUP BY is_active;

-- Models per category
SELECT category, COUNT(*) 
FROM public.models_catalog 
GROUP BY category;

-- Recent additions
SELECT name, created_at 
FROM public.models_catalog 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Backup Data

```sql
-- Export to JSON
SELECT jsonb_agg(row_to_json(mc)) 
FROM public.models_catalog mc;
```

Copy hasil query dan save ke file `backup-YYYY-MM-DD.json`

---

## ✅ SUCCESS CRITERIA

Setup dianggap berhasil jika:

- [ ] Query `SELECT * FROM public.models_catalog` mengembalikan 7 rows
- [ ] Query `SELECT * FROM get_models_catalog()` berjalan tanpa error
- [ ] File GLB bisa diakses via URL storage
- [ ] Website menampilkan semua model 3D
- [ ] Bisa tambah model baru via SQL
- [ ] Bisa edit dan hapus model

---

## 📞 SUPPORT

Jika ada masalah:

1. Cek error message di Supabase Dashboard
2. Cek browser console untuk error frontend
3. Lihat bagian Troubleshooting di atas
4. Review file `supabase/README.md` untuk detail lengkap

---

**Last Updated:** 2026-08-09

# Supabase Storage Setup Guide

## File yang Perlu Diupload ke Supabase Storage

File-file berikut terlalu besar untuk Git (>100MB) dan perlu diupload ke Supabase Storage:

1. **maskot-fm11.glb** (105.91 MB)
2. **ketua-dikopinda-kota-malang.glb** (128.02 MB)

File lainnya tetap disimpan di repository karena ukurannya kecil (<10MB).

## Langkah-langkah Setup

### 1. Login ke Supabase Dashboard
Buka: https://supabase.carubra.com

### 2. Buat Storage Bucket
- Pergi ke **Storage** di sidebar
- Klik **New bucket**
- Nama bucket: `3d-models`
- Set sebagai **Public bucket** (centang "Public bucket")
- Klik **Create bucket**

### 3. Upload File GLB
- Masuk ke bucket `3d-models` yang baru dibuat
- Klik **Upload file**
- Upload 2 file berikut:
  - `maskot-fm11.glb` (dari: `public/models/maskot-fm11.glb`)
  - `ketua-dikopinda-kota-malang.glb` (dari: `public/models/ketua-dikopinda-kota-malang.glb`)

### 4. Set Environment Variables
Edit file `.env` di root project:

```env
VITE_SUPABASE_URL=https://supabase.carubra.com
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Cara mendapatkan Anon Key:**
- Di Supabase Dashboard, pergi ke **Settings** > **API**
- Copy nilai dari **anon public**
- Paste ke `.env` file

### 5. Verify Storage Policy
Pastikan bucket `3d-models` memiliki policy yang memperbolehkan public read:

**Policy untuk public read:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = '3d-models' );
```

Atau lewat UI:
- Pergi ke **Storage** > **Policies**
- Pastikan ada policy untuk **SELECT** yang mengijinkan public access

### 6. Test Aplikasi
```bash
npm run dev
```

Buka browser dan pastikan semua model bisa diload dengan baik.

## Struktur File

**File di Supabase Storage:**
- `maskot-fm11.glb`
- `ketua-dikopinda-kota-malang.glb`

**File di Git Repository:**
- `miniatur- (1).glb` (7.59 MB)
- `miniatur- (2).glb` (3.81 MB)
- `miniatur- (3).glb` (4.36 MB)
- `miniatur- (4).glb` (3.6 MB)
- `miniatur- (5).glb` (3.17 MB)

## Troubleshooting

### Model tidak muncul
- Cek console browser untuk error
- Pastikan environment variables sudah benar
- Pastikan bucket policy sudah public
- Verify URL di browser: `https://supabase.carubra.com/storage/v1/object/public/3d-models/maskot-fm11.glb`

### CORS Error
Pastikan Supabase Storage CORS sudah dikonfigurasi untuk mengijinkan request dari domain aplikasi kamu.

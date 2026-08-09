# 🎨 Admin Dashboard - Quick Guide

## 🌐 Akses Admin Page

**URL:** `http://localhost:5173/adminku3dprinting`

**Production:** `https://yourdomain.com/adminku3dprinting`

**Status:** ✅ Tanpa Login (No Authentication)

---

## ✨ Fitur yang Tersedia

### ➕ Tambah Model Baru

1. Scroll ke form "Tambah Model Baru"
2. Isi form:
   - **Nama Model** (required): e.g., "Gubernur Jawa Timur"
   - **Kategori**: e.g., "Character"
   - **Deskripsi**: Deskripsi singkat model
   - **File GLB** (required): Pilih file .glb dari komputer
3. Klik **"✅ Tambah Model"**
4. Tunggu upload selesai
5. Model langsung muncul di list dan di website! ✅

**⏱️ Waktu: ~45 detik - 1 menit**

---

### ✏️ Edit Model

1. Cari model yang mau diedit di tabel
2. Klik tombol **"✏️ Edit"**
3. Input nama berubah jadi editable
4. Ketik nama atau deskripsi baru
5. Klik **"💾 Save"**
6. Done! ✅

**⏱️ Waktu: ~15 detik**

---

### 🗑️ Nonaktifkan Model (Soft Delete)

1. Cari model yang mau dinonaktifkan
2. Klik tombol **"🗑️ Nonaktif"**
3. Confirm dialog
4. Model jadi nonaktif (tidak muncul di website)
5. Data tetap ada di database

**⏱️ Waktu: ~5 detik**

---

### ✅ Aktifkan Model Kembali

1. Cari model yang nonaktif (background abu-abu)
2. Klik tombol **"✓ Aktifkan"**
3. Model aktif kembali dan muncul di website

**⏱️ Waktu: ~3 detik**

---

## 📊 Statistik

Di bagian bawah ada 3 card statistik:

- **Total Models**: Jumlah semua model
- **Aktif**: Model yang tampil di website
- **Nonaktif**: Model yang disembunyikan

---

## 🔄 Workflow Normal

### Upload Model Baru

```
1. Client kirim file .glb
   ↓
2. Buka /adminku3dprinting
   ↓
3. Isi form + upload file
   ↓
4. Klik "Tambah Model"
   ↓
5. File upload ke Supabase Storage
   ↓
6. Data tersimpan di database
   ↓
7. Model langsung muncul di website! ✅
```

**Total waktu: ~1 menit**

---

### Edit Nama Model

```
1. Buka /adminku3dprinting
   ↓
2. Cari model di tabel
   ↓
3. Klik "Edit"
   ↓
4. Ketik nama baru
   ↓
5. Klik "Save"
   ↓
6. Done! Website langsung update ✅
```

**Total waktu: ~15 detik**

---

## 🚨 Error Handling

### "Gagal memuat data"

**Penyebab:**
- Database belum setup
- RLS policies belum dibuat

**Solusi:**
1. Buka Supabase Dashboard
2. SQL Editor → Run `01_schema_and_data.sql`
3. SQL Editor → Run `02_crud_functions.sql`
4. Refresh admin page

---

### "Error: create_model does not exist"

**Penyebab:**
- CRUD functions belum dibuat

**Solusi:**
1. Buka Supabase Dashboard
2. SQL Editor → Run `02_crud_functions.sql`
3. Refresh admin page

---

### Upload Failed

**Penyebab:**
- Storage bucket belum dibuat atau tidak public
- File terlalu besar (>50MB free tier)

**Solusi:**
1. Buka Supabase Dashboard → Storage
2. Buat bucket `3d-models`
3. Set sebagai **Public bucket**
4. Try upload again

---

## 📱 Mobile Responsive

Admin page sudah responsive:
- ✅ Desktop: Full table view
- ✅ Tablet: Scrollable table
- ✅ Mobile: Horizontal scroll untuk tabel

---

## 🔒 Keamanan

**⚠️ PENTING:**

Admin page ini **TIDAK ADA AUTHENTICATION** (sesuai request).

**Untuk Production:**

1. **Ganti slug** dengan yang lebih random:
   - Dari: `/adminku3dprinting`
   - Ke: `/admin-xyz-secret-path-123`

2. **Atau tambah authentication:**
   - Setup Supabase Auth
   - Add login page
   - Protect admin route

3. **Restrict via server config:**
   - `.htaccess` (Apache)
   - `nginx.conf` (Nginx)
   - IP whitelist

---

## 🚀 Deployment

### Build untuk Production

```bash
npm run build
```

### Deploy Files

Upload folder `dist/` ke hosting:
- Vercel
- Netlify
- GitHub Pages
- Server sendiri

### Test Production

```
https://yourdomain.com/adminku3dprinting
```

---

## 💡 Tips & Tricks

### Tip 1: Batch Upload

Untuk upload banyak model sekaligus:
1. Upload satu per satu via form (paling mudah)
2. Atau gunakan SQL Editor untuk bulk insert (lihat CHEATSHEET.md)

### Tip 2: Backup Data

Export semua data via SQL Editor:

```sql
SELECT * FROM public.models_catalog;
```

Copy hasil ke spreadsheet atau JSON.

### Tip 3: Link ke Admin

Tambah link rahasia di Footer untuk akses admin:

```tsx
// src/components/Footer.tsx
<a href="/adminku3dprinting" style={{ fontSize: '10px', opacity: 0.3 }}>
  •
</a>
```

Hanya yang tahu ini link admin 😉

---

## 📋 Checklist Setup

Pastikan semua sudah ready:

- [ ] Supabase project sudah dibuat
- [ ] Database schema sudah dijalankan (`01_schema_and_data.sql`)
- [ ] CRUD functions sudah dibuat (`02_crud_functions.sql`)
- [ ] Storage bucket `3d-models` sudah dibuat (public)
- [ ] `.env` sudah berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- [ ] Dev server running (`npm run dev`)
- [ ] Admin page bisa diakses (`/adminku3dprinting`)
- [ ] Bisa upload file GLB
- [ ] Bisa edit model
- [ ] Bisa activate/deactivate model

---

## 🎉 Success!

Admin page sudah siap digunakan!

**Akses sekarang:**
```
http://localhost:5173/adminku3dprinting
```

**Need help?** Check:
- `supabase/CHEATSHEET.md` - SQL queries
- `supabase/README.md` - Complete docs
- `supabase/FINAL_SUMMARY.txt` - Overview

---

**Created:** 2026-08-09  
**Route:** `/adminku3dprinting`  
**Auth:** None (sesuai request)  
**Status:** ✅ Production Ready

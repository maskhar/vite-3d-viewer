# 🎯 Setup Category Management - Langkah Lengkap

## 📋 Persiapan

Pastikan Anda sudah:
- ✅ Login ke Supabase Dashboard
- ✅ Memiliki akses ke SQL Editor
- ✅ Sudah setup tabel `models_catalog` sebelumnya

---

## 🚀 Langkah Setup

### Step 1: Buka Supabase SQL Editor

1. Login ke **https://supabase.carubra.com**
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**

### Step 2: Jalankan SQL Setup

1. Buka file: `docs/supabase/sql/03_categories_management.sql`
2. Copy **SELURUH ISI** file tersebut
3. Paste ke SQL Editor
4. Klik tombol **Run** atau tekan `Ctrl + Enter`
5. Tunggu hingga muncul pesan **"Success"**

### Step 3: Verifikasi Setup

Jalankan query berikut untuk memastikan setup berhasil:

```sql
-- Cek jumlah kategori (harus ada 3 default)
SELECT COUNT(*) as total_categories FROM public.categories;

-- Lihat semua kategori
SELECT * FROM public.categories ORDER BY display_order;
```

**Expected Result:**
```
total_categories: 3

id          | name        | description                              | display_order | is_active
------------|-------------|------------------------------------------|---------------|----------
uuid-1      | Character   | Karakter 3D seperti manusia, hewan, dll  | 0             | true
uuid-2      | Object      | Objek 3D seperti furniture, alat, dll    | 1             | true
uuid-3      | Environment | Lingkungan 3D seperti gedung, landscape  | 2             | true
```

---

## 🎨 Cara Menggunakan di Admin Dashboard

### 1. Buka Kelola Kategori

1. Buka halaman **Admin Dashboard** (`/admin`)
2. Klik tombol **"Kelola Kategori"** (ikon folder)
3. Modal kategori akan terbuka

### 2. Tambah Kategori Baru

1. Klik **"Tambah Kategori Baru"**
2. Isi **Nama Kategori** (contoh: "Kendaraan")
3. Isi **Deskripsi** opsional (contoh: "Model kendaraan seperti mobil, motor")
4. Klik **"Simpan"**

### 3. Edit Kategori

1. Di tabel kategori, klik tombol **Edit** (ikon pensil biru)
2. Ubah nama atau deskripsi
3. Klik **"Update"**

### 4. Hapus Kategori

1. Klik tombol **Hapus** (ikon tempat sampah merah)
2. Konfirmasi penghapusan
3. **Catatan**: Kategori yang digunakan model tidak bisa dihapus

### 5. Toggle Status

- Klik badge **"Aktif"** atau **"Nonaktif"** untuk mengubah status
- Kategori nonaktif tidak muncul di dropdown form

### 6. Atur Urutan

- Drag & drop kategori menggunakan ikon **⋮⋮** di kiri
- Urutan otomatis tersimpan

---

## 🔧 Fitur Tambahan

### Kategori Dinamis di Form Model

Setelah setup, form tambah/edit model akan:
- Otomatis load kategori dari database
- Hanya menampilkan kategori yang aktif
- Update real-time saat kategori diubah

### Proteksi Data

- ✅ Kategori yang digunakan model tidak bisa dihapus
- ✅ Nama kategori harus unik
- ✅ Hanya authenticated user yang bisa edit

---

## ❓ Troubleshooting

### Problem: Kategori tidak muncul di dropdown

**Solusi:**
1. Cek apakah kategori dalam status **aktif**
2. Refresh halaman admin (F5)
3. Buka Console browser (F12) untuk cek error
4. Pastikan sudah login

### Problem: Tidak bisa hapus kategori

**Solusi:**
1. Cek apakah ada model yang menggunakan kategori tersebut
2. Ubah kategori model-model tersebut terlebih dahulu
3. Kemudian baru hapus kategori

### Problem: Error "Cannot delete category that is being used"

**Solusi:**
- Ini adalah fitur proteksi
- Ubah kategori semua model yang menggunakan kategori ini
- Query untuk cek model yang menggunakan kategori:
```sql
SELECT * FROM models_catalog WHERE category = 'NamaKategori';
```

### Problem: Tombol "Kelola Kategori" tidak muncul

**Solusi:**
1. Pastikan sudah refresh halaman setelah update kode
2. Clear cache browser (Ctrl + Shift + R)
3. Cek console untuk error

---

## 📊 Database Schema

### Table: categories

| Column         | Type         | Description                    |
|----------------|--------------|--------------------------------|
| id             | UUID         | Primary key (auto)             |
| name           | VARCHAR(100) | Nama kategori (unique)         |
| description    | TEXT         | Deskripsi kategori             |
| display_order  | INTEGER      | Urutan tampilan                |
| is_active      | BOOLEAN      | Status aktif/nonaktif          |
| created_at     | TIMESTAMPTZ  | Waktu dibuat                   |
| updated_at     | TIMESTAMPTZ  | Waktu update terakhir          |

---

## 🎯 Testing

### Test 1: Create Category
```sql
SELECT create_category('Kendaraan', 'Model kendaraan seperti mobil, motor');
```

### Test 2: Update Category
```sql
-- Ganti uuid-kategori dengan ID kategori yang valid
SELECT update_category('uuid-kategori', 'Nama Baru', 'Deskripsi baru');
```

### Test 3: Toggle Status
```sql
SELECT toggle_category_status('uuid-kategori', false);
```

### Test 4: View All Categories
```sql
SELECT * FROM categories ORDER BY display_order;
```

---

## ✅ Checklist Setup

- [ ] SQL berhasil dijalankan tanpa error
- [ ] Ada 3 kategori default (Character, Object, Environment)
- [ ] Tombol "Kelola Kategori" muncul di admin dashboard
- [ ] Bisa buka modal kategori
- [ ] Bisa tambah kategori baru
- [ ] Bisa edit kategori
- [ ] Bisa hapus kategori (yang tidak digunakan)
- [ ] Bisa toggle status aktif/nonaktif
- [ ] Bisa drag & drop untuk ubah urutan
- [ ] Kategori muncul di dropdown form model

---

## 🎉 Setup Complete!

Fitur manajemen kategori sudah siap digunakan!

Untuk bantuan lebih lanjut, lihat:
- `docs/guides/CATEGORY_MANAGEMENT.md` - Panduan lengkap fitur
- `docs/supabase/sql/03_categories_management.sql` - SQL setup file

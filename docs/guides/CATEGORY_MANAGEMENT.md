# 📁 Category Management Feature

## Overview
Fitur manajemen kategori memungkinkan Anda untuk menambah, mengedit, menghapus, dan mengatur urutan kategori model 3D secara dinamis.

## Setup Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- File: docs/supabase/sql/03_categories_management.sql
```

Copy dan jalankan seluruh isi file `03_categories_management.sql` di Supabase Dashboard.

## Fitur yang Tersedia

### 1. Tambah Kategori Baru
- Klik tombol "Kelola Kategori" di Admin Dashboard
- Klik "Tambah Kategori Baru"
- Isi nama kategori (wajib) dan deskripsi (opsional)
- Klik "Simpan"

### 2. Edit Kategori
- Di tabel kategori, klik tombol edit (ikon pensil)
- Ubah nama atau deskripsi
- Klik "Update"

### 3. Hapus Kategori
- Klik tombol hapus (ikon tempat sampah)
- **Catatan**: Kategori yang sedang digunakan oleh model tidak bisa dihapus
- Konfirmasi penghapusan

### 4. Aktif/Nonaktifkan Kategori
- Klik badge status (Aktif/Nonaktif) untuk toggle
- Kategori nonaktif tidak akan muncul di form tambah model

### 5. Atur Urutan Kategori
- Drag & drop menggunakan ikon grip (⋮⋮) di sebelah kiri
- Urutan akan otomatis tersimpan ke database

## Integrasi dengan Model

Kategori yang aktif akan otomatis muncul di:
- Form tambah model baru
- Filter kategori di tabel model
- Dropdown kategori di edit model

## Kategori Default

Saat pertama kali setup, sistem akan membuat 3 kategori default:
1. **Character** - Karakter 3D seperti manusia, hewan, dll
2. **Object** - Objek 3D seperti furniture, alat, dll
3. **Environment** - Lingkungan 3D seperti gedung, landscape, dll

## Proteksi Data

- Kategori yang sedang digunakan oleh model tidak bisa dihapus
- Sistem akan menampilkan tombol hapus dengan status disabled
- Tooltip akan menunjukkan "Kategori sedang digunakan"

## API Functions

### create_category
```sql
SELECT create_category('Nama Kategori', 'Deskripsi opsional');
```

### update_category
```sql
SELECT update_category('uuid-kategori', 'Nama Baru', 'Deskripsi baru');
```

### delete_category
```sql
SELECT delete_category('uuid-kategori');
```

### toggle_category_status
```sql
SELECT toggle_category_status('uuid-kategori', true/false);
```

## Troubleshooting

### Kategori tidak muncul di dropdown
- Pastikan kategori dalam status aktif
- Refresh halaman admin
- Cek console browser untuk error

### Tidak bisa hapus kategori
- Cek apakah ada model yang menggunakan kategori tersebut
- Ubah kategori model tersebut terlebih dahulu
- Kemudian hapus kategori

### Error saat simpan kategori
- Pastikan nama kategori unik (tidak duplikat)
- Cek koneksi ke Supabase
- Pastikan user sudah authenticated

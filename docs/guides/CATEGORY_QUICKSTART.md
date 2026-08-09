# 🚀 Quick Start - Category Management

## Setup dalam 3 Langkah

### 1️⃣ Jalankan SQL di Supabase (2 menit)
```bash
1. Buka https://supabase.carubra.com
2. Klik SQL Editor > New Query
3. Copy file: docs/supabase/sql/03_categories_management.sql
4. Paste & Run
5. Selesai! ✅
```

### 2️⃣ Buka Admin Dashboard (30 detik)
```bash
1. Buka http://localhost:5174/admin
2. Klik tombol "Kelola Kategori"
3. Modal terbuka!
```

### 3️⃣ Kelola Kategori (sesuka hati)
```bash
✅ Tambah kategori baru
✅ Edit kategori existing
✅ Drag & drop untuk reorder
✅ Toggle aktif/nonaktif
✅ Hapus kategori (yang tidak digunakan)
```

---

## 🎯 Yang Sudah Dibuat

| Component | File | Status |
|-----------|------|--------|
| Database Setup | `docs/supabase/sql/03_categories_management.sql` | ✅ Ready |
| Category Manager UI | `src/components/CategoryManager.tsx` | ✅ Ready |
| Admin Integration | `src/pages/AdminPage.tsx` | ✅ Updated |
| Documentation | `docs/guides/CATEGORY_*.md` | ✅ Complete |

---

## 🎨 Screenshot Fitur

### Tombol di Admin Dashboard
```
[🏠 Kembali ke Home] [📁 Kelola Kategori] [➕ Tambah Model Baru]
```

### Modal Kelola Kategori
```
╔═══════════════════════════════════╗
║  Kelola Kategori            [X]   ║
╠═══════════════════════════════════╣
║  [+ Tambah Kategori Baru]         ║
║                                    ║
║  Tabel:                           ║
║  ⋮⋮ Character    [Aktif]  [Edit]  ║
║  ⋮⋮ Object       [Aktif]  [Edit]  ║
║  ⋮⋮ Environment  [Aktif]  [Edit]  ║
╚═══════════════════════════════════╝
```

---

## 📚 Dokumentasi Lengkap

1. **CATEGORY_SETUP.md** - Setup step-by-step lengkap
2. **CATEGORY_MANAGEMENT.md** - Panduan penggunaan fitur
3. **CATEGORY_FEATURE_SUMMARY.md** - Technical details & summary

---

## ❓ Troubleshooting Cepat

**Q: Kategori tidak muncul?**
A: Refresh halaman (F5) dan pastikan sudah login

**Q: Tidak bisa hapus kategori?**
A: Kategori sedang digunakan model, ubah dulu kategori modelnya

**Q: Tombol "Kelola Kategori" tidak ada?**
A: Clear cache browser (Ctrl+Shift+R)

---

## ✅ Checklist

- [ ] SQL berhasil dijalankan
- [ ] 3 kategori default muncul
- [ ] Tombol "Kelola Kategori" ada
- [ ] Bisa buka modal
- [ ] Semua fitur CRUD berfungsi

---

**Setup complete! 🎉**

Untuk detail lebih lanjut, baca: `docs/guides/CATEGORY_SETUP.md`

# 🌐 SETUP ADMIN PAGE - Step by Step Guide

## 📋 Cara Setup Admin Dashboard di Website

### Step 1: Copy File Admin Component

1. Buka file: `supabase/simple-admin-page.tsx`
2. Copy semua isinya
3. Paste ke: `src/pages/AdminPage.tsx` (buat file baru)

### Step 2: Install Dependencies (jika belum)

```bash
npm install @supabase/supabase-js
```

### Step 3: Add Route

**Jika pakai React Router, edit `src/App.tsx`:**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
// ... import lainnya

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Jika BELUM pakai React Router:**

```bash
npm install react-router-dom
```

Lalu update App.tsx seperti di atas.

### Step 4: Test Admin Page

```bash
npm run dev
```

Buka browser:
```
http://localhost:5173/admin
```

---

## 🎯 Cara Pakai Admin Dashboard

### ✅ TAMBAH MODEL BARU

1. Buka: `http://localhost:5173/admin`
2. Isi form:
   - **Nama Model**: e.g., "Bupati Sidoarjo"
   - **Kategori**: e.g., "Character"
   - **Deskripsi**: e.g., "Miniatur Bupati Sidoarjo"
   - **File GLB**: Klik "Choose File" → Pilih .glb file
3. Klik **"✅ Tambah Model"**
4. Tunggu upload selesai
5. Model langsung muncul di list dan di website! ✅

**⏱️ Total waktu: ~1 menit**

---

### ✏️ EDIT MODEL

1. Buka admin page
2. Cari model yang mau diedit di table
3. Klik **"✏️ Edit"**
4. Input berubah jadi editable
5. Edit nama atau deskripsi
6. Klik **"💾 Save"**
7. Done! ✅

**⏱️ Total waktu: ~30 detik**

---

### 🗑️ NONAKTIFKAN MODEL

1. Buka admin page
2. Cari model yang mau dinonaktifkan
3. Klik **"🗑️ Nonaktif"**
4. Confirm
5. Model jadi nonaktif (tidak muncul di website tapi data masih ada)

**Untuk aktifkan lagi:**
- Klik **"✓ Aktifkan"** di model yang nonaktif

---

### 🔄 UPDATE FILE GLB

**Cara 1: Via Admin Dashboard (Upload Baru)**
1. Tambah model baru dengan nama sama
2. Nonaktifkan model lama
3. Done!

**Cara 2: Via Supabase Storage (Ganti File)**
1. Buka Storage di Supabase Dashboard
2. Hapus file lama
3. Upload file baru dengan nama yang sama
4. Website otomatis pakai file baru! ✅

---

## 🔐 Tambah Authentication (Optional)

Supaya hanya admin yang bisa akses `/admin`, tambahkan authentication:

### Step 1: Setup Supabase Auth

```tsx
// src/pages/AdminPage.tsx - Tambah di awal component

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    });
  }, [navigate]);

  // ... rest of component
}
```

### Step 2: Buat Login Page

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      alert('Login success!');
      navigate('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Step 3: Add Login Route

```tsx
// src/App.tsx
<Route path="/login" element={<LoginPage />} />
```

### Step 4: Buat User di Supabase

1. Buka Supabase Dashboard
2. **Authentication** → **Users**
3. Klik **"Invite User"** atau **"Add User"**
4. Masukkan email & password
5. Done! Sekarang bisa login

---

## 🎨 Customization

### Ganti Warna Theme

```tsx
// Ganti class di AdminPage.tsx
bg-blue-600 → bg-purple-600  // Button color
text-blue-600 → text-purple-600  // Link color
```

### Tambah Field

Misal mau tambah field "tags":

```tsx
// 1. Tambah di form state
const [formData, setFormData] = useState({
  // ... existing
  tags: '',
});

// 2. Tambah input field
<input
  value={formData.tags}
  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
  placeholder="Tags (comma separated)"
/>

// 3. Update database schema dulu via SQL:
// ALTER TABLE models_catalog ADD COLUMN tags TEXT;
```

---

## 📱 Mobile Responsive

Admin page sudah responsive by default. Test di browser:
- Desktop: Full table view
- Tablet: Scrollable table
- Mobile: Scrollable table dengan touch

---

## 🐛 Troubleshooting

### Error: "supabase is not defined"
**Solusi:** Pastikan file `src/lib/supabase.ts` ada:

```tsx
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Error: "Failed to upload"
**Solusi:**
1. Check Storage bucket `3d-models` exists
2. Check bucket is public
3. Check file size < 50MB (free tier limit)

### Model tidak muncul setelah ditambah
**Solusi:**
1. Check `is_active = true`
2. Refresh halaman catalog
3. Check console untuk error

### Page blank setelah login
**Solusi:**
1. Check React Router installed
2. Check route path benar
3. Check browser console untuk error

---

## ✅ Summary

**Setup Time:** 5-10 menit  
**Daily Use:** 1-2 menit per operation

**Yang bisa dilakukan:**
✅ Upload file GLB + Tambah data (1 form)
✅ Edit nama & deskripsi (inline edit)
✅ Nonaktifkan/Aktifkan model (1 click)
✅ Lihat stats real-time

**Keuntungan:**
✅ No SQL knowledge needed
✅ User-friendly interface
✅ Instant updates
✅ Mobile friendly

---

**Next:** Buka `simple-admin-page.tsx` dan copy ke project kamu! 🚀

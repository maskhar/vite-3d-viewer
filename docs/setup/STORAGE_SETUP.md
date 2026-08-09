# Storage Setup & RLS Policies Fix

## Problem
Error: `StorageApiError: new row violates row-level security policy`

Ini terjadi karena Supabase Storage memerlukan RLS policies untuk mengatur siapa yang bisa upload, update, dan delete files.

## Solution

### Option 1: Temporary Fix for Development (Public Upload)

Jika kamu ingin cepat untuk development, buat policy yang allow public upload:

1. Buka Supabase Dashboard ? SQL Editor
2. Run query ini:

```sql
-- Allow public upload (HANYA UNTUK DEVELOPMENT)
CREATE POLICY "Public can upload 3D models"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models');

CREATE POLICY "Public can update 3D models"
ON storage.objects FOR UPDATE
USING (bucket_id = '3d-models')
WITH CHECK (bucket_id = '3d-models');
```

### Option 2: Proper Solution with Authentication (Recommended)

Untuk production, sebaiknya hanya authenticated users yang bisa upload:

1. Run file `supabase/04_storage_policies.sql` di Supabase SQL Editor
2. Tambahkan authentication di admin page

#### Setup Authentication

Ada beberapa cara:

**A. Simple Password Protection**
Tambahkan password check di admin page:

```typescript
// Di AdminPage.tsx, tambahkan state
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [password, setPassword] = useState('');

// Tambahkan check di awal component
if (!isAuthenticated) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          placeholder="Enter password"
        />
        <button
          onClick={() => {
            if (password === 'YOUR_SECRET_PASSWORD') {
              setIsAuthenticated(true);
            }
          }}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
```

**B. Supabase Auth (Better)**
Gunakan Supabase Authentication:

```typescript
// Login dengan email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'your-password'
});
```

## Quick Fix Command

Run ini di Supabase SQL Editor untuk allow public upload (development only):

```sql
-- Enable public upload for development
CREATE POLICY "Public upload for development"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models');

CREATE POLICY "Public update for development"
ON storage.objects FOR UPDATE
USING (bucket_id = '3d-models');

CREATE POLICY "Public read"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');
```

## Verify Storage Bucket

Pastikan bucket '3d-models' sudah dibuat dan public:

1. Buka Supabase Dashboard ? Storage
2. Cek apakah bucket '3d-models' ada
3. Pastikan bucket is Public (untuk read access)

Jika belum ada, create dengan:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-models', '3d-models', true)
ON CONFLICT (id) DO NOTHING;
```

## Next Steps

1. Run SQL policies di Supabase
2. Refresh browser
3. Try upload lagi
4. Jika masih error, cek di Supabase Dashboard ? Storage ? Policies

## Security Notes

- **Development**: Public upload OK untuk testing
- **Production**: Gunakan authentication + RLS policies
- **Alternative**: Upload files manual ke storage, admin page hanya manage metadata

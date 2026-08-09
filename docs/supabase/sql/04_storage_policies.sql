-- ============================================
-- STORAGE POLICIES untuk 3D Models
-- ============================================
-- File ini mengatur akses ke Supabase Storage bucket '3d-models'

-- ============================================
-- 1. Enable RLS on Storage
-- ============================================
-- RLS sudah enabled by default di Supabase Storage

-- ============================================
-- 2. Public Read Access
-- ============================================
-- Semua orang bisa download/view files
CREATE POLICY "Public Access for 3D Models"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');

-- ============================================
-- 3. Authenticated Upload Access
-- ============================================
-- User yang authenticated bisa upload files
CREATE POLICY "Authenticated users can upload 3D models"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- ============================================
-- 4. Authenticated Update Access
-- ============================================
-- User yang authenticated bisa update files
CREATE POLICY "Authenticated users can update 3D models"
ON storage.objects FOR UPDATE
USING (bucket_id = '3d-models' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- ============================================
-- 5. Authenticated Delete Access
-- ============================================
-- User yang authenticated bisa delete files
CREATE POLICY "Authenticated users can delete 3D models"
ON storage.objects FOR DELETE
USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- ============================================
-- ALTERNATIVE: Public Upload (Less Secure)
-- ============================================
-- Jika ingin allow anonymous upload (TIDAK DISARANKAN untuk production)
-- Uncomment policy di bawah dan comment policy authenticated di atas

-- DROP POLICY IF EXISTS "Authenticated users can upload 3D models" ON storage.objects;
-- 
-- CREATE POLICY "Anyone can upload 3D models"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = '3d-models');

-- ============================================
-- NOTES
-- ============================================
-- Untuk testing di development, kamu bisa:
-- 1. Use authenticated user untuk upload
-- 2. Atau temporarily allow public upload
-- 
-- Untuk production, sebaiknya:
-- - Hanya authenticated users yang bisa upload/update/delete
-- - Public hanya bisa read
-- - Tambahkan authentication di admin page

-- ============================================
-- CREATE BUCKET (jika belum ada)
-- ============================================
-- Run ini di Supabase SQL Editor jika bucket belum dibuat

INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-models', '3d-models', true)
ON CONFLICT (id) DO NOTHING;

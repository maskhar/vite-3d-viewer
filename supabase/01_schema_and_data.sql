-- ============================================
-- Supabase SQL Schema untuk Dashboard CRUD Katalog 3D Models
-- ============================================
-- File ini berisi semua SQL yang perlu dijalankan di Supabase SQL Editor
-- untuk membuat database schema, policies, dan sample data

-- ============================================
-- 1. CREATE TABLE: models_catalog
-- ============================================
-- Tabel utama untuk menyimpan data katalog model 3D

CREATE TABLE IF NOT EXISTS public.models_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  model_filename VARCHAR(255) NOT NULL,
  
  -- Preview settings (JSON)
  preview_camera_x DECIMAL(10, 2) DEFAULT 0,
  preview_camera_y DECIMAL(10, 2) DEFAULT 1,
  preview_camera_z DECIMAL(10, 2) DEFAULT 7,
  preview_rotation_x DECIMAL(10, 2) DEFAULT 0,
  preview_rotation_y DECIMAL(10, 2) DEFAULT 0,
  preview_rotation_z DECIMAL(10, 2) DEFAULT 0,
  preview_scale DECIMAL(10, 2) DEFAULT 2,
  
  -- Viewer settings (JSON)
  viewer_auto_rotate BOOLEAN DEFAULT false,
  viewer_auto_rotate_speed DECIMAL(10, 2) DEFAULT 0.5,
  viewer_camera_x DECIMAL(10, 2) DEFAULT 0,
  viewer_camera_y DECIMAL(10, 2) DEFAULT 1,
  viewer_camera_z DECIMAL(10, 2) DEFAULT 5,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_models_catalog_category ON public.models_catalog(category);
CREATE INDEX IF NOT EXISTS idx_models_catalog_active ON public.models_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_models_catalog_order ON public.models_catalog(display_order);

-- Add comment
COMMENT ON TABLE public.models_catalog IS 'Katalog model 3D yang ditampilkan di website';

-- ============================================
-- 2. FUNCTION: Auto update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto update timestamp
DROP TRIGGER IF EXISTS update_models_catalog_updated_at ON public.models_catalog;
CREATE TRIGGER update_models_catalog_updated_at
    BEFORE UPDATE ON public.models_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.models_catalog ENABLE ROW LEVEL SECURITY;

-- Policy: Public dapat READ semua model yang aktif
CREATE POLICY "Public can view active models"
ON public.models_catalog
FOR SELECT
USING (is_active = true);

-- Policy: Authenticated users dapat READ semua model
CREATE POLICY "Authenticated users can view all models"
ON public.models_catalog
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users dapat INSERT
CREATE POLICY "Authenticated users can insert models"
ON public.models_catalog
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users dapat UPDATE
CREATE POLICY "Authenticated users can update models"
ON public.models_catalog
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users dapat DELETE
CREATE POLICY "Authenticated users can delete models"
ON public.models_catalog
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 4. INSERT SAMPLE DATA (dari data.ts existing)
-- ============================================

-- Clear existing data (optional, comment jika tidak mau hapus data lama)
-- TRUNCATE public.models_catalog CASCADE;

-- Insert data dari file data.ts yang sudah ada
INSERT INTO public.models_catalog (
  name, 
  category, 
  description, 
  model_filename,
  preview_camera_x,
  preview_camera_y,
  preview_camera_z,
  preview_scale,
  viewer_auto_rotate,
  viewer_auto_rotate_speed,
  viewer_camera_x,
  viewer_camera_y,
  viewer_camera_z,
  display_order
) VALUES
  (
    'Maskot FM 11',
    'Character',
    'Futuristic space explorer',
    'maskot-fm11.glb',
    0, 1, -2,
    0.6,
    false, 0.5,
    0, 1, 5,
    1
  ),
  (
    'Wali Kota Malang',
    'Character',
    'Wali Kota Malang',
    'Wali Kota Malang - Full Badan.glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    2
  ),
  (
    'Sekretaris Daerah Provinsi Jawa Timur',
    'Character',
    'Sekretaris Daerah Provinsi Jawa Timur',
    'miniatur- (1).glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    3
  ),
  (
    'Menteri Pemuda dan Olahraga',
    'Character',
    'Menteri Pemuda dan Olahraga',
    'miniatur- (2).glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    4
  ),
  (
    'Ketua Dekopinda Kota Malang',
    'Character',
    'Ketua Dekopinda Kota Malang',
    'miniatur- (3).glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    5
  ),
  (
    'Ketua Dekopinwil Jawa Timur',
    'Character',
    'Ketua Dekopinwil Jawa Timur',
    'miniatur- (4).glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    6
  ),
  (
    'Wali Kota Malang',
    'Character',
    'Wali Kota Malang',
    'miniatur- (5).glb',
    0, 1, 7,
    2,
    false, 0.5,
    0, 1, 5,
    7
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. USEFUL QUERIES untuk Dashboard Admin
-- ============================================

-- View semua models
-- SELECT * FROM public.models_catalog ORDER BY display_order;

-- View active models only
-- SELECT * FROM public.models_catalog WHERE is_active = true ORDER BY display_order;

-- Insert new model
-- INSERT INTO public.models_catalog (name, category, description, model_filename)
-- VALUES ('New Model Name', 'Character', 'Description here', 'filename.glb');

-- Update model
-- UPDATE public.models_catalog 
-- SET name = 'Updated Name', description = 'Updated desc'
-- WHERE id = 'uuid-here';

-- Soft delete (set inactive)
-- UPDATE public.models_catalog SET is_active = false WHERE id = 'uuid-here';

-- Hard delete
-- DELETE FROM public.models_catalog WHERE id = 'uuid-here';

-- Update display order
-- UPDATE public.models_catalog SET display_order = 1 WHERE id = 'uuid-here';

-- ============================================
-- 6. HELPER VIEWS (Optional) - SECURITY FIXED
-- ============================================

-- View untuk mendapatkan data dalam format yang siap pakai frontend
-- FIXED: Added security_invoker = true to prevent SECURITY DEFINER vulnerability
CREATE OR REPLACE VIEW public.models_catalog_formatted
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  category,
  description,
  model_filename,
  jsonb_build_object(
    'cameraPosition', jsonb_build_array(preview_camera_x, preview_camera_y, preview_camera_z),
    'rotation', jsonb_build_array(preview_rotation_x, preview_rotation_y, preview_rotation_z),
    'scale', preview_scale
  ) as preview,
  jsonb_build_object(
    'autoRotate', viewer_auto_rotate,
    'autoRotateSpeed', viewer_auto_rotate_speed,
    'cameraPosition', jsonb_build_array(viewer_camera_x, viewer_camera_y, viewer_camera_z)
  ) as viewer,
  is_active,
  display_order,
  created_at,
  updated_at
FROM public.models_catalog
ORDER BY display_order;

-- Grant access ke view
GRANT SELECT ON public.models_catalog_formatted TO anon, authenticated;

-- ============================================
-- DONE! 
-- ============================================
-- Copy semua SQL di atas dan jalankan di Supabase SQL Editor
-- Dashboard URL: https://supabase.carubra.com
-- Navigate to: SQL Editor > New Query > Paste > Run
--
-- SECURITY NOTE:
-- View now uses security_invoker = true (SECURITY INVOKER)
-- This ensures queries respect the permissions of the user making the query,
-- not the view creator, preventing privilege escalation attacks.

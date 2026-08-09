-- ============================================
-- CATEGORY MANAGEMENT SYSTEM - SQL SETUP
-- ============================================
-- File: 03_categories_management.sql
-- Deskripsi: Setup tabel kategori dan fungsi CRUD
-- Jalankan di: Supabase SQL Editor
-- ============================================

-- STEP 1: Create categories table
-- Tabel ini menyimpan semua kategori model 3D
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Add trigger for updated_at
-- Trigger ini otomatis update timestamp saat ada perubahan
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 3: Insert default categories
-- Data kategori default untuk memulai
INSERT INTO public.categories (name, description, display_order, is_active) VALUES
  ('Character', 'Karakter 3D seperti manusia, hewan, dll', 0, true),
  ('Object', 'Objek 3D seperti furniture, alat, dll', 1, true),
  ('Environment', 'Lingkungan 3D seperti gedung, landscape, dll', 2, true)
ON CONFLICT (name) DO NOTHING;

-- STEP 4: Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies
-- Policy untuk public (siapa saja bisa lihat kategori aktif)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- Policy untuk authenticated users (bisa lihat semua)
CREATE POLICY "Authenticated users can view all categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Policy untuk insert
CREATE POLICY "Authenticated users can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy untuk update
CREATE POLICY "Authenticated users can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (true);

-- Policy untuk delete
CREATE POLICY "Authenticated users can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (true);

-- STEP 6: CRUD Functions
-- ============================================

-- Function: CREATE Category
CREATE OR REPLACE FUNCTION create_category(
  p_name VARCHAR(100),
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
  v_max_order INTEGER;
BEGIN
  -- Get max display_order
  SELECT COALESCE(MAX(display_order), -1) INTO v_max_order
  FROM public.categories;

  -- Insert new category
  INSERT INTO public.categories (name, description, display_order)
  VALUES (p_name, p_description, v_max_order + 1)
  RETURNING id INTO v_category_id;

  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: UPDATE Category
CREATE OR REPLACE FUNCTION update_category(
  p_id UUID,
  p_name VARCHAR(100),
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET 
    name = p_name,
    description = p_description
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: DELETE Category
CREATE OR REPLACE FUNCTION delete_category(
  p_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Check if category is being used by any models
  IF EXISTS (
    SELECT 1 
    FROM public.models_catalog 
    WHERE category = (SELECT name FROM public.categories WHERE id = p_id)
  ) THEN
    RAISE EXCEPTION 'Cannot delete category that is being used by models';
  END IF;

  DELETE FROM public.categories WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: TOGGLE Category Status
CREATE OR REPLACE FUNCTION toggle_category_status(
  p_id UUID,
  p_is_active BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET is_active = p_is_active
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order 
  ON public.categories(display_order);

CREATE INDEX IF NOT EXISTS idx_categories_is_active 
  ON public.categories(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_name 
  ON public.categories(name);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Jalankan query berikut untuk verifikasi setup berhasil:

-- 1. Cek jumlah kategori
-- SELECT COUNT(*) as total_categories FROM public.categories;

-- 2. Lihat semua kategori
-- SELECT * FROM public.categories ORDER BY display_order;

-- 3. Test create category
-- SELECT create_category('Kendaraan', 'Model kendaraan seperti mobil, motor, dll');

-- 4. Test update category
-- SELECT update_category('uuid-kategori', 'Nama Baru', 'Deskripsi baru');

-- 5. Test toggle status
-- SELECT toggle_category_status('uuid-kategori', false);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

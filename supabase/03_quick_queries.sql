-- ============================================
-- QUICK START QUERIES
-- ============================================
-- Copy-paste queries untuk operasi sehari-hari

-- ============================================
-- 1. LIHAT SEMUA DATA
-- ============================================

-- Lihat semua model dengan format lengkap
SELECT 
  id,
  name,
  category,
  model_filename,
  is_active,
  display_order,
  created_at
FROM public.models_catalog
ORDER BY display_order, created_at DESC;

-- ============================================
-- 2. TAMBAH MODEL BARU (SIMPLE)
-- ============================================

-- Template paling simple
SELECT create_model(
  'NAMA_MODEL_DISINI',           -- Ganti dengan nama model
  'Character',                    -- Ganti kategori jika perlu
  'DESKRIPSI_DISINI',            -- Ganti dengan deskripsi
  'nama-file.glb'                -- Ganti dengan nama file GLB di storage
);

-- Contoh nyata:
SELECT create_model(
  'Bupati Sidoarjo',
  'Character',
  'Miniatur Bupati Sidoarjo',
  'bupati-sidoarjo.glb'
);

-- ============================================
-- 3. EDIT NAMA & DESKRIPSI
-- ============================================

-- Step 1: Cari UUID model yang mau diedit
SELECT id, name FROM public.models_catalog 
WHERE name LIKE '%keyword%';  -- Ganti keyword dengan nama model

-- Step 2: Update dengan UUID yang didapat
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_name := 'Nama Baru',
  p_description := 'Deskripsi Baru'
);

-- ============================================
-- 4. GANTI NAMA FILE GLB
-- ============================================

-- Jika kamu sudah upload file baru ke storage dan mau ganti referensinya
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_model_filename := 'nama-file-baru.glb'
);

-- ============================================
-- 5. UBAH URUTAN TAMPILAN
-- ============================================

-- Lihat urutan saat ini
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;

-- Update satu model
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_display_order := 1  -- Angka urutan yang diinginkan
);

-- ============================================
-- 6. NONAKTIFKAN MODEL (SOFT DELETE)
-- ============================================

-- Model tidak akan muncul di website tapi data tetap ada
SELECT deactivate_model('PASTE_UUID_DISINI'::UUID);

-- Atau pakai update_model
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_is_active := false
);

-- ============================================
-- 7. AKTIFKAN KEMBALI MODEL
-- ============================================

SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_is_active := true
);

-- ============================================
-- 8. HAPUS PERMANEN (HARD DELETE)
-- ============================================

-- HATI-HATI! Data tidak bisa dikembalikan
SELECT delete_model('PASTE_UUID_DISINI'::UUID);

-- ============================================
-- 9. SEARCH/CARI MODEL
-- ============================================

-- Cari berdasarkan nama, deskripsi, atau kategori
SELECT * FROM search_models('Malang');  -- Ganti dengan keyword

-- Atau manual
SELECT id, name, category, description
FROM public.models_catalog
WHERE 
  name ILIKE '%keyword%' 
  OR description ILIKE '%keyword%';

-- ============================================
-- 10. LIHAT STATISTIK
-- ============================================

-- Total model
SELECT COUNT(*) as total_models FROM public.models_catalog;

-- Model aktif vs nonaktif
SELECT 
  CASE WHEN is_active THEN 'Aktif' ELSE 'Nonaktif' END as status,
  COUNT(*) as jumlah
FROM public.models_catalog
GROUP BY is_active;

-- Model per kategori
SELECT category, COUNT(*) as jumlah
FROM public.models_catalog
WHERE is_active = true
GROUP BY category;

-- ============================================
-- 11. BATCH UPDATE URUTAN
-- ============================================

-- Step 1: Lihat ID dan urutan saat ini
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;

-- Step 2: Update semua urutan sekaligus (ganti UUID dengan yang sesuai)
SELECT update_display_orders('[
  {"id": "uuid-1", "order": 1},
  {"id": "uuid-2", "order": 2},
  {"id": "uuid-3", "order": 3},
  {"id": "uuid-4", "order": 4},
  {"id": "uuid-5", "order": 5}
]'::JSONB);

-- ============================================
-- 12. EDIT POSISI KAMERA & SCALE
-- ============================================

-- Update preview settings
SELECT update_model(
  'PASTE_UUID_DISINI'::UUID,
  p_preview_camera_x := 0,
  p_preview_camera_y := 1,
  p_preview_camera_z := 5,
  p_preview_scale := 1.5
);

-- ============================================
-- 13. DUPLICATE/CLONE MODEL
-- ============================================

-- Clone model existing (buat duplicate)
WITH source AS (
  SELECT * FROM public.models_catalog 
  WHERE id = 'PASTE_UUID_DISINI'::UUID
)
INSERT INTO public.models_catalog (
  name, category, description, model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate, display_order
)
SELECT 
  name || ' (Salinan)',
  category,
  description,
  model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate,
  display_order + 1
FROM source
RETURNING id, name;

-- ============================================
-- 14. EXPORT DATA TO JSON
-- ============================================

-- Export semua data dalam format JSON (untuk backup)
SELECT jsonb_agg(
  jsonb_build_object(
    'id', id,
    'name', name,
    'category', category,
    'description', description,
    'model_filename', model_filename,
    'preview', jsonb_build_object(
      'cameraPosition', jsonb_build_array(preview_camera_x, preview_camera_y, preview_camera_z),
      'scale', preview_scale
    ),
    'viewer', jsonb_build_object(
      'autoRotate', viewer_auto_rotate,
      'autoRotateSpeed', viewer_auto_rotate_speed,
      'cameraPosition', jsonb_build_array(viewer_camera_x, viewer_camera_y, viewer_camera_z)
    ),
    'is_active', is_active,
    'display_order', display_order
  )
  ORDER BY display_order
) as catalog_backup
FROM public.models_catalog;

-- ============================================
-- 15. RESET AUTO INCREMENT (jika perlu)
-- ============================================

-- Reset display_order mulai dari 1
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order, created_at) as new_order
  FROM public.models_catalog
)
UPDATE public.models_catalog m
SET display_order = o.new_order
FROM ordered o
WHERE m.id = o.id;

-- ============================================
-- TIPS & TRICKS
-- ============================================

-- Tip 1: Selalu backup sebelum hard delete
-- SELECT * FROM public.models_catalog WHERE id = 'uuid-here';

-- Tip 2: Gunakan soft delete (deactivate) daripada hard delete
-- Lebih aman dan bisa di-restore kapan saja

-- Tip 3: Cara mendapatkan UUID dengan mudah
-- SELECT id, name FROM public.models_catalog ORDER BY name;
-- Copy UUID dari hasil query

-- Tip 4: Test query di model yang tidak penting dulu
-- Sebelum jalankan di production data

-- Tip 5: Gunakan TRANSACTION untuk batch operations
BEGIN;
  -- Your queries here
  SELECT update_model(...);
  SELECT update_model(...);
COMMIT;
-- Jika ada error, rollback dengan: ROLLBACK;

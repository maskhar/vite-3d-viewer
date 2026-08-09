# ⚡ SQL Cheat Sheet - Copy Paste Ready

## 📖 READ Operations

### Lihat Semua Model
```sql
SELECT * FROM public.models_catalog ORDER BY display_order;
```

### Lihat Model Aktif Saja
```sql
SELECT * FROM public.models_catalog 
WHERE is_active = true 
ORDER BY display_order;
```

### Lihat dengan Format JSON (siap untuk frontend)
```sql
SELECT * FROM get_models_catalog(p_active_only := true);
```

### Lihat 1 Model Berdasarkan ID
```sql
SELECT * FROM get_model_by_id('UUID-DISINI'::UUID);
```

### Cari Model Berdasarkan Nama
```sql
SELECT id, name, category 
FROM public.models_catalog 
WHERE name ILIKE '%KEYWORD%';
```

### Search dengan Function
```sql
SELECT * FROM search_models('KEYWORD');
```

### Lihat Berdasarkan Kategori
```sql
SELECT * FROM public.models_catalog 
WHERE category = 'Character' 
ORDER BY display_order;
```

### Lihat Semua Kategori
```sql
SELECT * FROM get_categories();
```

---

## ✏️ CREATE Operations

### Tambah Model Baru (Simple)
```sql
SELECT create_model(
  'NAMA_MODEL',
  'Character',
  'DESKRIPSI',
  'filename.glb'
);
```

### Tambah Model Baru (Full Options)
```sql
SELECT create_model(
  'Nama Model',              -- name
  'Character',               -- category
  'Deskripsi model',         -- description
  'model-file.glb',          -- filename
  0,                         -- preview_camera_x
  1,                         -- preview_camera_y
  7,                         -- preview_camera_z
  2,                         -- preview_scale
  false,                     -- viewer_auto_rotate
  10                         -- display_order
);
```

---

## 🔄 UPDATE Operations

### Update Nama & Deskripsi
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_name := 'Nama Baru',
  p_description := 'Deskripsi Baru'
);
```

### Update Kategori
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_category := 'New Category'
);
```

### Update Nama File
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_model_filename := 'new-filename.glb'
);
```

### Update Posisi Kamera
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_preview_camera_x := 0,
  p_preview_camera_y := 2,
  p_preview_camera_z := 8,
  p_preview_scale := 1.5
);
```

### Update Display Order
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_display_order := 1
);
```

### Aktifkan Model
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_is_active := true
);
```

### Nonaktifkan Model
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_is_active := false
);
```

### Update Multiple Fields
```sql
SELECT update_model(
  'UUID-DISINI'::UUID,
  p_name := 'New Name',
  p_category := 'New Category',
  p_description := 'New Description',
  p_display_order := 5,
  p_is_active := true
);
```

---

## 🗑️ DELETE Operations

### Soft Delete (Recommended)
```sql
SELECT deactivate_model('UUID-DISINI'::UUID);
```

### Hard Delete (Permanent)
```sql
SELECT delete_model('UUID-DISINI'::UUID);
```

### Delete Manual
```sql
-- Soft delete
UPDATE public.models_catalog 
SET is_active = false 
WHERE id = 'UUID-DISINI';

-- Hard delete
DELETE FROM public.models_catalog 
WHERE id = 'UUID-DISINI';
```

---

## 📊 BATCH Operations

### Update Display Order (Multiple Models)
```sql
SELECT update_display_orders('[
  {"id": "uuid-1", "order": 1},
  {"id": "uuid-2", "order": 2},
  {"id": "uuid-3", "order": 3},
  {"id": "uuid-4", "order": 4}
]'::JSONB);
```

### Activate Multiple Models
```sql
UPDATE public.models_catalog 
SET is_active = true 
WHERE category = 'Character';
```

### Deactivate Multiple Models
```sql
UPDATE public.models_catalog 
SET is_active = false 
WHERE display_order > 10;
```

---

## 🔍 SEARCH & FILTER

### Search Anywhere
```sql
SELECT * FROM public.models_catalog 
WHERE 
  name ILIKE '%KEYWORD%' 
  OR description ILIKE '%KEYWORD%' 
  OR category ILIKE '%KEYWORD%';
```

### Filter Active by Category
```sql
SELECT * FROM public.models_catalog 
WHERE is_active = true 
  AND category = 'Character'
ORDER BY display_order;
```

### Get Models Created Today
```sql
SELECT * FROM public.models_catalog 
WHERE created_at::date = CURRENT_DATE;
```

### Get Recently Updated (Last 7 days)
```sql
SELECT * FROM public.models_catalog 
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

---

## 📈 STATISTICS

### Total Models
```sql
SELECT COUNT(*) as total FROM public.models_catalog;
```

### Active vs Inactive Count
```sql
SELECT 
  CASE WHEN is_active THEN 'Aktif' ELSE 'Nonaktif' END as status,
  COUNT(*) as jumlah
FROM public.models_catalog
GROUP BY is_active;
```

### Models per Category
```sql
SELECT category, COUNT(*) as jumlah
FROM public.models_catalog
WHERE is_active = true
GROUP BY category
ORDER BY jumlah DESC;
```

### Average Scale by Category
```sql
SELECT 
  category,
  AVG(preview_scale) as avg_scale
FROM public.models_catalog
GROUP BY category;
```

---

## 🛠️ UTILITY Queries

### Get UUID by Name
```sql
SELECT id, name FROM public.models_catalog 
WHERE name ILIKE '%KEYWORD%';
```

### Check if File Exists
```sql
SELECT 
  model_filename,
  COUNT(*) as usage_count
FROM public.models_catalog
WHERE model_filename = 'filename.glb'
GROUP BY model_filename;
```

### Find Duplicate Names
```sql
SELECT name, COUNT(*) as count
FROM public.models_catalog
GROUP BY name
HAVING COUNT(*) > 1;
```

### Reset Display Order
```sql
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order, created_at) as new_order
  FROM public.models_catalog
)
UPDATE public.models_catalog m
SET display_order = o.new_order
FROM ordered o
WHERE m.id = o.id;
```

---

## 📦 BACKUP & RESTORE

### Export All Data to JSON
```sql
SELECT jsonb_agg(row_to_json(mc)) 
FROM public.models_catalog mc;
```

### Export Active Models Only
```sql
SELECT jsonb_agg(row_to_json(mc)) 
FROM public.models_catalog mc
WHERE is_active = true;
```

### Clone/Duplicate Model
```sql
WITH source AS (
  SELECT * FROM public.models_catalog 
  WHERE id = 'UUID-ASLI'::UUID
)
INSERT INTO public.models_catalog (
  name, category, description, model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate, display_order
)
SELECT 
  name || ' (Copy)',
  category,
  description,
  model_filename,
  preview_camera_x, preview_camera_y, preview_camera_z,
  preview_scale, viewer_auto_rotate,
  display_order + 1
FROM source
RETURNING id, name;
```

---

## 🔧 MAINTENANCE

### Update All Timestamps
```sql
UPDATE public.models_catalog 
SET updated_at = NOW();
```

### Fix Null Descriptions
```sql
UPDATE public.models_catalog 
SET description = 'No description'
WHERE description IS NULL;
```

### Normalize Display Orders
```sql
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order) * 10 as new_order
  FROM public.models_catalog
)
UPDATE public.models_catalog m
SET display_order = o.new_order
FROM ordered o
WHERE m.id = o.id;
```

---

## 🚨 EMERGENCY Queries

### Disable All Models
```sql
UPDATE public.models_catalog SET is_active = false;
```

### Enable All Models
```sql
UPDATE public.models_catalog SET is_active = true;
```

### Delete All Test Data
```sql
DELETE FROM public.models_catalog 
WHERE name LIKE '%Test%' OR name LIKE '%test%';
```

### Rollback (if within transaction)
```sql
ROLLBACK;
```

---

## 💡 USEFUL Combinations

### Template: Add New Model Workflow
```sql
-- 1. Upload file.glb to Storage first via Dashboard

-- 2. Add to database
SELECT create_model(
  'Nama Model',
  'Character',
  'Deskripsi',
  'uploaded-file.glb'
);

-- 3. Verify
SELECT * FROM public.models_catalog 
WHERE name = 'Nama Model';

-- 4. Test URL (paste in browser)
-- https://supabase.carubra.com/storage/v1/object/public/3d-models/uploaded-file.glb
```

### Template: Rename File Workflow
```sql
-- 1. Upload new file to Storage

-- 2. Get UUID
SELECT id, name, model_filename 
FROM public.models_catalog 
WHERE name = 'Model Name';

-- 3. Update reference
SELECT update_model(
  'UUID-FROM-STEP-2'::UUID,
  p_model_filename := 'new-filename.glb'
);

-- 4. Delete old file from Storage
-- (Manual via Dashboard)
```

### Template: Reorder All Models
```sql
-- 1. See current order
SELECT id, name, display_order 
FROM public.models_catalog 
ORDER BY display_order;

-- 2. Copy UUIDs and create JSON
SELECT update_display_orders('[
  {"id": "first-uuid", "order": 1},
  {"id": "second-uuid", "order": 2},
  {"id": "third-uuid", "order": 3}
]'::JSONB);

-- 3. Verify
SELECT name, display_order 
FROM public.models_catalog 
ORDER BY display_order;
```

---

## 📋 Quick Reference Table

| Operation | Function | Direct SQL |
|-----------|----------|------------|
| Read all | `get_models_catalog()` | `SELECT * FROM models_catalog` |
| Read one | `get_model_by_id(uuid)` | `SELECT * WHERE id = 'uuid'` |
| Create | `create_model(...)` | `INSERT INTO ...` |
| Update | `update_model(uuid, ...)` | `UPDATE ... WHERE id = 'uuid'` |
| Soft Delete | `deactivate_model(uuid)` | `UPDATE SET is_active = false` |
| Hard Delete | `delete_model(uuid)` | `DELETE FROM ... WHERE id = 'uuid'` |
| Search | `search_models('term')` | `SELECT * WHERE name ILIKE '%term%'` |

---

## 🎯 Pro Tips

1. **Always use UUID in queries**
   ```sql
   -- ✅ Good
   'a1b2c3d4-...'::UUID
   
   -- ❌ Bad
   'a1b2c3d4-...'
   ```

2. **Use ILIKE for case-insensitive search**
   ```sql
   -- ✅ Case insensitive
   WHERE name ILIKE '%keyword%'
   
   -- ❌ Case sensitive
   WHERE name LIKE '%keyword%'
   ```

3. **Always backup before bulk operations**
   ```sql
   -- Backup first
   SELECT * FROM public.models_catalog;
   
   -- Then do bulk update
   UPDATE ...
   ```

4. **Use transactions for multiple operations**
   ```sql
   BEGIN;
     -- Your queries here
     UPDATE ...;
     INSERT ...;
   COMMIT;
   -- Or ROLLBACK if error
   ```

---

**Quick Access:**
- Copy query → Paste to SQL Editor → Replace placeholders → Run
- UUID placeholder: `UUID-DISINI` or `uuid-here`
- Keyword placeholder: `KEYWORD` or `keyword`

**Last Updated:** 2026-08-09

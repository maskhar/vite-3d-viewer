-- ============================================
-- CRUD API FUNCTIONS untuk Dashboard Admin
-- ============================================
-- File ini berisi stored procedures untuk operasi CRUD
-- yang lebih aman dan konsisten

-- ============================================
-- 1. FUNCTION: Get All Models (dengan filtering)
-- ============================================

CREATE OR REPLACE FUNCTION get_models_catalog(
  p_category VARCHAR DEFAULT NULL,
  p_active_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  category VARCHAR,
  description TEXT,
  model_filename VARCHAR,
  preview JSONB,
  viewer JSONB,
  is_active BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.id,
    mc.name,
    mc.category,
    mc.description,
    mc.model_filename,
    jsonb_build_object(
      'cameraPosition', jsonb_build_array(mc.preview_camera_x, mc.preview_camera_y, mc.preview_camera_z),
      'rotation', jsonb_build_array(mc.preview_rotation_x, mc.preview_rotation_y, mc.preview_rotation_z),
      'scale', mc.preview_scale
    ) as preview,
    jsonb_build_object(
      'autoRotate', mc.viewer_auto_rotate,
      'autoRotateSpeed', mc.viewer_auto_rotate_speed,
      'cameraPosition', jsonb_build_array(mc.viewer_camera_x, mc.viewer_camera_y, mc.viewer_camera_z)
    ) as viewer,
    mc.is_active,
    mc.display_order,
    mc.created_at,
    mc.updated_at
  FROM public.models_catalog mc
  WHERE 
    (p_category IS NULL OR mc.category = p_category)
    AND (p_active_only = false OR mc.is_active = true)
  ORDER BY mc.display_order, mc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_models_catalog TO anon, authenticated;

-- ============================================
-- 2. FUNCTION: Get Single Model by ID
-- ============================================

CREATE OR REPLACE FUNCTION get_model_by_id(p_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  category VARCHAR,
  description TEXT,
  model_filename VARCHAR,
  preview JSONB,
  viewer JSONB,
  is_active BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.id,
    mc.name,
    mc.category,
    mc.description,
    mc.model_filename,
    jsonb_build_object(
      'cameraPosition', jsonb_build_array(mc.preview_camera_x, mc.preview_camera_y, mc.preview_camera_z),
      'rotation', jsonb_build_array(mc.preview_rotation_x, mc.preview_rotation_y, mc.preview_rotation_z),
      'scale', mc.preview_scale
    ) as preview,
    jsonb_build_object(
      'autoRotate', mc.viewer_auto_rotate,
      'autoRotateSpeed', mc.viewer_auto_rotate_speed,
      'cameraPosition', jsonb_build_array(mc.viewer_camera_x, mc.viewer_camera_y, mc.viewer_camera_z)
    ) as viewer,
    mc.is_active,
    mc.display_order,
    mc.created_at,
    mc.updated_at
  FROM public.models_catalog mc
  WHERE mc.id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_model_by_id TO anon, authenticated;

-- ============================================
-- 3. FUNCTION: Create New Model
-- ============================================

CREATE OR REPLACE FUNCTION create_model(
  p_name VARCHAR,
  p_category VARCHAR,
  p_description TEXT,
  p_model_filename VARCHAR,
  p_preview_camera_x DECIMAL DEFAULT 0,
  p_preview_camera_y DECIMAL DEFAULT 1,
  p_preview_camera_z DECIMAL DEFAULT 7,
  p_preview_scale DECIMAL DEFAULT 2,
  p_viewer_auto_rotate BOOLEAN DEFAULT false,
  p_display_order INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
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
    display_order
  ) VALUES (
    p_name,
    p_category,
    p_description,
    p_model_filename,
    p_preview_camera_x,
    p_preview_camera_y,
    p_preview_camera_z,
    p_preview_scale,
    p_viewer_auto_rotate,
    p_display_order
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_model TO authenticated;

-- ============================================
-- 4. FUNCTION: Update Model
-- ============================================

CREATE OR REPLACE FUNCTION update_model(
  p_id UUID,
  p_name VARCHAR DEFAULT NULL,
  p_category VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_model_filename VARCHAR DEFAULT NULL,
  p_preview_camera_x DECIMAL DEFAULT NULL,
  p_preview_camera_y DECIMAL DEFAULT NULL,
  p_preview_camera_z DECIMAL DEFAULT NULL,
  p_preview_scale DECIMAL DEFAULT NULL,
  p_viewer_auto_rotate BOOLEAN DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_display_order INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.models_catalog
  SET
    name = COALESCE(p_name, name),
    category = COALESCE(p_category, category),
    description = COALESCE(p_description, description),
    model_filename = COALESCE(p_model_filename, model_filename),
    preview_camera_x = COALESCE(p_preview_camera_x, preview_camera_x),
    preview_camera_y = COALESCE(p_preview_camera_y, preview_camera_y),
    preview_camera_z = COALESCE(p_preview_camera_z, preview_camera_z),
    preview_scale = COALESCE(p_preview_scale, preview_scale),
    viewer_auto_rotate = COALESCE(p_viewer_auto_rotate, viewer_auto_rotate),
    is_active = COALESCE(p_is_active, is_active),
    display_order = COALESCE(p_display_order, display_order)
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_model TO authenticated;

-- ============================================
-- 5. FUNCTION: Soft Delete (deactivate)
-- ============================================

CREATE OR REPLACE FUNCTION deactivate_model(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.models_catalog
  SET is_active = false
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION deactivate_model TO authenticated;

-- ============================================
-- 6. FUNCTION: Hard Delete
-- ============================================

CREATE OR REPLACE FUNCTION delete_model(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.models_catalog
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_model TO authenticated;

-- ============================================
-- 7. FUNCTION: Bulk Update Display Order
-- ============================================

CREATE OR REPLACE FUNCTION update_display_orders(
  p_updates JSONB -- Format: [{"id": "uuid", "order": 1}, ...]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_item JSONB;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE public.models_catalog
    SET display_order = (v_item->>'order')::INTEGER
    WHERE id = (v_item->>'id')::UUID;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_display_orders TO authenticated;

-- ============================================
-- 8. FUNCTION: Get Categories (distinct)
-- ============================================

CREATE OR REPLACE FUNCTION get_categories()
RETURNS TABLE (
  category VARCHAR,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.category,
    COUNT(*) as count
  FROM public.models_catalog mc
  WHERE mc.is_active = true
  GROUP BY mc.category
  ORDER BY mc.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_categories TO anon, authenticated;

-- ============================================
-- 9. FUNCTION: Search Models
-- ============================================

CREATE OR REPLACE FUNCTION search_models(p_search_term VARCHAR)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  category VARCHAR,
  description TEXT,
  model_filename VARCHAR,
  is_active BOOLEAN,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.id,
    mc.name,
    mc.category,
    mc.description,
    mc.model_filename,
    mc.is_active,
    mc.display_order
  FROM public.models_catalog mc
  WHERE 
    mc.name ILIKE '%' || p_search_term || '%'
    OR mc.description ILIKE '%' || p_search_term || '%'
    OR mc.category ILIKE '%' || p_search_term || '%'
  ORDER BY mc.display_order, mc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_models TO anon, authenticated;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Get all active models
-- SELECT * FROM get_models_catalog(p_active_only := true);

-- Get models by category
-- SELECT * FROM get_models_catalog(p_category := 'Character');

-- Get single model
-- SELECT * FROM get_model_by_id('uuid-here');

-- Create new model
-- SELECT create_model(
--   'New Character',
--   'Character',
--   'Description here',
--   'new-model.glb'
-- );

-- Update model
-- SELECT update_model(
--   'uuid-here'::UUID,
--   p_name := 'Updated Name',
--   p_description := 'Updated description'
-- );

-- Soft delete
-- SELECT deactivate_model('uuid-here'::UUID);

-- Hard delete
-- SELECT delete_model('uuid-here'::UUID);

-- Bulk update orders
-- SELECT update_display_orders('[
--   {"id": "uuid-1", "order": 1},
--   {"id": "uuid-2", "order": 2}
-- ]'::JSONB);

-- Search models
-- SELECT * FROM search_models('Malang');

-- Get all categories
-- SELECT * FROM get_categories();

-- ============================================
-- FIX: Security Issue - Remove SECURITY DEFINER
-- ============================================

-- Drop existing view
DROP VIEW IF EXISTS public.models_catalog_formatted;

-- Recreate view with SECURITY INVOKER (safer)
-- This ensures the view uses the permissions of the querying user, not the view creator
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
-- What Changed:
-- ============================================
-- BEFORE: View used SECURITY DEFINER (default) - bypassed RLS
-- AFTER: View uses SECURITY INVOKER - respects user permissions & RLS
--
-- Security Benefit:
-- - Each user's query will be checked against their own RLS policies
-- - Prevents privilege escalation
-- - More secure and follows best practices
-- ============================================

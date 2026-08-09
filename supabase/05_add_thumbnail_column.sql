-- Add thumbnail column to models_catalog table

-- Run this in Supabase SQL Editor:

ALTER TABLE models_catalog 
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Add comment
COMMENT ON COLUMN models_catalog.thumbnail_path IS 'Path to static thumbnail image for fast preview';

-- Example update query for existing models:
-- UPDATE models_catalog 
-- SET thumbnail_path = 'thumbnails/maskot-fm11-thumb.jpg' 
-- WHERE name = 'Maskot FM 11';


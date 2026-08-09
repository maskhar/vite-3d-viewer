# Thumbnail Generator Guide

## Option 1: Using Blender (Recommended for Quality)

### Automated Blender Script

1. Open Blender
2. Go to Scripting tab
3. Paste this script:

```python
import bpy
import os

# Configuration
input_dir = "C:/path/to/your/models"  # Change this
output_dir = "C:/path/to/output/thumbnails"  # Change this
image_size = (800, 800)

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Setup camera
bpy.data.objects['Camera'].location = (0, 2, 5)
bpy.data.objects['Camera'].rotation_euler = (1.1, 0, 0)

# Setup lighting
bpy.ops.object.light_add(type='SUN', location=(5, 5, 5))
bpy.ops.object.light_add(type='SUN', location=(-5, 5, -5))

# Render settings
bpy.context.scene.render.resolution_x = image_size[0]
bpy.context.scene.render.resolution_y = image_size[1]
bpy.context.scene.render.image_settings.file_format = 'JPEG'
bpy.context.scene.render.image_settings.quality = 90

# Process each GLB file
for filename in os.listdir(input_dir):
    if filename.endswith('.glb') or filename.endswith('.gltf'):
        # Clear scene
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Import model
        filepath = os.path.join(input_dir, filename)
        bpy.ops.import_scene.gltf(filepath=filepath)
        
        # Render
        output_name = os.path.splitext(filename)[0] + '-thumb.jpg'
        output_path = os.path.join(output_dir, output_name)
        bpy.context.scene.render.filepath = output_path
        bpy.ops.render.render(write_still=True)
        
        print(f"Generated: {output_name}")

print("Thumbnail generation complete!")
```

4. Update `input_dir` and `output_dir` paths
5. Click "Run Script"

---

## Option 2: Using Three.js Node Script (Requires Setup)

### Install Dependencies:

```bash
npm install canvas three
```

### Run Script:

```bash
node scripts/generateThumbnails.js
```

**Note:** This requires Node.js with canvas support which can be tricky on Windows.

---

## Option 3: Manual Screenshots (Quick & Easy)

### Steps:

1. Open your website in development mode: `npm run dev`
2. Click on each model to open the viewer
3. Position the camera nicely
4. Take a screenshot (Windows: Win+Shift+S)
5. Crop to square (800x800px recommended)
6. Save as `.jpg` in `public/thumbnails/`
7. Name it: `model-name-thumb.jpg`

---

## Option 4: Online Tools

### Using Online 3D Viewer:

1. Go to https://3dviewer.net/ or https://gltf-viewer.donmccurdy.com/
2. Upload your GLB file
3. Adjust camera angle
4. Take screenshot
5. Save to `public/thumbnails/`

---

## After Generating Thumbnails

Update `src/data.ts` to include thumbnail paths:

```typescript
import { getThumbnailUrl, getLocalThumbnailUrl } from './utils/storage';

{
  id: '1',
  name: 'Maskot FM 11',
  category: 'Character',
  modelPath: getModelUrl('maskot-fm11.glb'),
  thumbnailPath: getThumbnailUrl('maskot-fm11-thumb.jpg'), // For Supabase
  // OR
  thumbnailPath: getLocalThumbnailUrl('maskot-fm11-thumb.jpg'), // For local files
  ...
}
```

### For Supabase Storage:

Upload thumbnails to Supabase Storage:
- Bucket: `3d-models`
- Folder: `thumbnails/`
- Files: `model-name-thumb.jpg`

---

## Recommended Thumbnail Specifications

- **Format:** JPEG or WebP
- **Resolution:** 800x800px (or 1200x1200px for retina)
- **Quality:** 85-90%
- **Background:** Match your site theme (dark: #0f0f1a)
- **Camera Angle:** 3/4 view showing the model clearly
- **Lighting:** Well-lit, similar to your 3D viewer

---

## Tips for Best Results

1. **Consistent Camera Position:** Use same angle for all models
2. **Good Lighting:** Match your viewer's lighting setup
3. **Center the Model:** Ensure model is centered in frame
4. **Appropriate Zoom:** Model should fill ~70% of frame
5. **File Size:** Keep under 200KB per thumbnail for performance


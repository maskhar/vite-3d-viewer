# Draco Compression Setup Guide

## What is Draco Compression?

Draco is a library for compressing and decompressing 3D geometric meshes and point clouds. It can reduce file sizes by **70-90%** while maintaining visual quality.

## Quick Setup

### 1. Copy Draco Decoder Files

Download the Draco decoder from: https://www.gstatic.com/draco/v1/decoders/

You need these files in `public/draco/`:
- `draco_decoder.wasm`
- `draco_wasm_wrapper.js`
- `draco_decoder.js`

Or use CDN (already configured in code):
```
https://www.gstatic.com/draco/versioned/decoders/1.5.6/
```

### 2. drei Already Supports Draco

The `@react-three/drei` library's `useGLTF` hook automatically supports Draco-compressed models. No additional code needed!

### 3. Compress Your Models

#### Option A: Using gltf-pipeline (Recommended)

```bash
npm install -g gltf-pipeline

# Compress a single model
gltf-pipeline -i input.glb -o output.glb -d

# Batch compress all models
for file in *.glb; do
  gltf-pipeline -i "$file" -o "compressed_$file" -d
done
```

#### Option B: Using Blender

1. Install Blender (https://www.blender.org/)
2. Open your model
3. File > Export > glTF 2.0
4. Enable "Draco mesh compression" in export settings
5. Set compression level (default: 6)
6. Export

#### Option C: Using Online Tools

1. Go to: https://gltf.report/
2. Upload your GLB file
3. Click "Export" with Draco compression enabled
4. Download the compressed version

### 4. Replace Your Models

Replace the original GLB files with compressed versions:
- Backup originals first!
- Test compressed models in your viewer
- Compare file sizes

### 5. Verify Compression

Check file sizes before/after:

```bash
# Original
maskot-fm11.glb: 111 MB

# After Draco compression (expected)
maskot-fm11.glb: 10-30 MB (70-90% reduction)
```

## Current Models to Compress

```
Large models (priority):
- ketua-dikopinda-kota-malang.glb (128 MB) → ~13-38 MB
- maskot-fm11.glb (111 MB) → ~11-33 MB

Medium models:
- miniatur- (1).glb (7.9 MB) → ~0.8-2.4 MB
- miniatur- (2).glb (4 MB) → ~0.4-1.2 MB
- miniatur- (3).glb (4.5 MB) → ~0.5-1.4 MB
- miniatur- (4).glb (3.7 MB) → ~0.4-1.1 MB
- miniatur- (5).glb (3.3 MB) → ~0.3-1 MB
```

## Testing

After compression, test:

1. Run dev server: `npm run dev`
2. Check models load correctly
3. Verify no visual quality loss
4. Test on slow network (Chrome DevTools → Network → Slow 3G)

## Benefits After Draco Compression

✅ 70-90% smaller file sizes
✅ Faster downloads
✅ Lower bandwidth costs
✅ Better mobile experience
✅ No code changes needed (drei handles it automatically)

## Troubleshooting

**Issue: Models don't load after compression**
- Ensure Draco decoder files are accessible
- Check browser console for errors
- Verify compression was successful

**Issue: Quality loss**
- Increase compression level in gltf-pipeline
- Use Blender with higher quality settings
- Some highly detailed models may show artifacts

**Issue: Slow initial load**
- Draco decoding takes CPU time
- Trade-off: smaller file size vs decode time
- Usually worth it for large models

## Recommended Workflow

1. Generate thumbnails first (for instant preview)
2. Compress models with Draco
3. Upload compressed models to Supabase
4. Update paths in data.ts
5. Test thoroughly

---

**Note:** Lazy loading is already implemented in ModelCard.tsx using Intersection Observer!

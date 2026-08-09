# 3D Model Catalog

A futuristic 3D model catalog website built with Vite, React, TypeScript, and Three.js. Large model files are stored in Supabase Storage for optimal performance.

## Features

- Interactive 3D model catalog with grid layout
- Full-featured 3D viewer modal with controls
- Auto-rotate, grid, wireframe, and lighting controls
- Responsive design for desktop, tablet, and mobile
- Modern futuristic UI design
- Supabase Storage integration for large files

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://supabase.carubra.com
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase Storage

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create storage bucket
- Upload large model files
- Configure access policies

### 4. Development

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

### 6. Preview Production Build

```bash
npm run preview
```

## Storage Strategy

**Large files (>100MB) - Stored in Supabase Storage:**
- `maskot-fm11.glb` (105.91 MB)
- `ketua-dikopinda-kota-malang.glb` (128.02 MB)

**Smaller files (<10MB) - Stored in Git:**
- `miniatur- (1).glb` (7.59 MB)
- `miniatur- (2).glb` (3.81 MB)
- `miniatur- (3).glb` (4.36 MB)
- `miniatur- (4).glb` (3.6 MB)
- `miniatur- (5).glb` (3.17 MB)

## Adding 3D Models

### For Small Models (<100MB)

1. Add your `.glb` file to `public/models/`
2. Update `src/data.ts`:

```typescript
{
  id: 'unique-id',
  name: 'Model Name',
  category: 'Category',
  description: 'Description',
  modelPath: getLocalModelUrl('your-model.glb'),
  preview: {
    cameraPosition: [0, 1, 7],
    scale: 2,
  },
  viewer: {
    autoRotate: false,
    autoRotateSpeed: 0.5,
    cameraPosition: [0, 1, 5],
  },
}
```

### For Large Models (>100MB)

1. Upload your `.glb` file to Supabase Storage bucket `3d-models`
2. Update `src/data.ts`:

```typescript
{
  id: 'unique-id',
  name: 'Model Name',
  category: 'Category',
  description: 'Description',
  modelPath: getModelUrl('your-model.glb'),
  preview: {
    cameraPosition: [0, 1, 7],
    scale: 2,
  },
  viewer: {
    autoRotate: false,
    autoRotateSpeed: 0.5,
    cameraPosition: [0, 1, 5],
  },
}
```

## Project Structure

```
src/
├── components/       # React components
├── lib/             # Library configurations (Supabase)
├── utils/           # Utility functions (storage helpers)
├── types.ts         # TypeScript type definitions
├── data.ts          # Model catalog data
├── App.tsx          # Main app component
└── main.tsx         # App entry point

public/
└── models/          # Small 3D model files (<100MB)
```

## Tech Stack

- Vite
- React 18
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- Supabase (Storage)
- Lucide React (icons)

## Deployment

When deploying, make sure to:
1. Set environment variables in your hosting platform
2. Upload large model files to Supabase Storage
3. Verify bucket policies are public for read access

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

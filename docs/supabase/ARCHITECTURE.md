# 🏗️ Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / ADMIN                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
├─────────────────────────────────────────────────────────────────┤
│  • src/components/Catalog.tsx        (Public View)              │
│  • src/components/AdminDashboard.tsx (Admin CRUD)               │
│  • src/services/catalogService.ts    (API Calls)                │
│  • src/types/supabase.ts             (TypeScript Types)         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS (Supabase Client)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   POSTGRESQL DB      │      │   STORAGE BUCKET     │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │ • models_catalog     │      │ • 3d-models/         │        │
│  │   (table)            │      │   - maskot-fm11.glb  │        │
│  │                      │      │   - miniatur-(1).glb │        │
│  │ Functions:           │      │   - ...              │        │
│  │ • get_models_catalog │      │                      │        │
│  │ • create_model       │      │ Public Access ✅     │        │
│  │ • update_model       │      │                      │        │
│  │ • delete_model       │      │                      │        │
│  │ • search_models      │      │                      │        │
│  │                      │      │                      │        │
│  │ RLS Policies: ✅     │      │                      │        │
│  └──────────────────────┘      └──────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1️⃣ Public User (View Models)

```
User → Website → Catalog Component
                      ↓
              catalogService.getModelsCatalog()
                      ↓
              Supabase RPC: get_models_catalog(p_active_only: true)
                      ↓
              PostgreSQL Query (dengan RLS)
                      ↓
              Return JSON [models]
                      ↓
              Transform to Model3D[]
                      ↓
              Render 3D Models in Grid
                      ↓
              Load GLB from Storage URL
```

### 2️⃣ Admin User (Add New Model)

```
Admin → Admin Dashboard → Upload GLB File
                              ↓
                      Supabase Storage Upload
                      (3d-models/new-model.glb)
                              ↓
                      Fill Form (name, category, desc)
                              ↓
                      catalogService.createModel()
                              ↓
                      Supabase RPC: create_model()
                              ↓
                      PostgreSQL INSERT
                              ↓
                      Return UUID
                              ↓
                      Reload Models List
                              ↓
                      Model appears on website ✅
```

### 3️⃣ Admin User (Edit Model)

```
Admin → Admin Dashboard → Click Edit
                              ↓
                      Get model by ID
                              ↓
                      Edit form (inline or modal)
                              ↓
                      catalogService.updateModel()
                              ↓
                      Supabase RPC: update_model()
                              ↓
                      PostgreSQL UPDATE
                              ↓
                      Auto-update updated_at timestamp
                              ↓
                      Return success
                              ↓
                      Reload and show updated data ✅
```

### 4️⃣ Admin User (Delete Model)

```
Admin → Admin Dashboard → Click Delete
                              ↓
                      Confirm dialog
                              ↓
                      catalogService.deactivateModel() (Soft)
                      OR
                      catalogService.deleteModel() (Hard)
                              ↓
                      Supabase RPC: deactivate_model() or delete_model()
                              ↓
                      PostgreSQL UPDATE (is_active=false) or DELETE
                              ↓
                      Return success
                              ↓
                      Model removed from list ✅
```

---

## Database Schema

```
┌────────────────────────────────────────────────────────────┐
│                    models_catalog                          │
├────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                             │
│     name                  VARCHAR(255)                     │
│     category              VARCHAR(100)                     │
│     description           TEXT                             │
│     model_filename        VARCHAR(255)                     │
│                                                            │
│     preview_camera_x      DECIMAL(10,2)                    │
│     preview_camera_y      DECIMAL(10,2)                    │
│     preview_camera_z      DECIMAL(10,2)                    │
│     preview_rotation_x    DECIMAL(10,2)                    │
│     preview_rotation_y    DECIMAL(10,2)                    │
│     preview_rotation_z    DECIMAL(10,2)                    │
│     preview_scale         DECIMAL(10,2)                    │
│                                                            │
│     viewer_auto_rotate        BOOLEAN                      │
│     viewer_auto_rotate_speed  DECIMAL(10,2)                │
│     viewer_camera_x       DECIMAL(10,2)                    │
│     viewer_camera_y       DECIMAL(10,2)                    │
│     viewer_camera_z       DECIMAL(10,2)                    │
│                                                            │
│     is_active             BOOLEAN                          │
│     display_order         INTEGER                          │
│                                                            │
│     created_at            TIMESTAMPTZ                      │
│     updated_at            TIMESTAMPTZ                      │
└────────────────────────────────────────────────────────────┘

Indexes:
  - idx_models_catalog_category   ON (category)
  - idx_models_catalog_active     ON (is_active)
  - idx_models_catalog_order      ON (display_order)

Triggers:
  - update_updated_at_column   (BEFORE UPDATE)
```

---

## RLS Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Row Level Security                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUBLIC (Anonymous):                                         │
│    ✅ SELECT   WHERE is_active = true                       │
│    ❌ INSERT                                                 │
│    ❌ UPDATE                                                 │
│    ❌ DELETE                                                 │
│                                                              │
│  AUTHENTICATED (Logged in):                                  │
│    ✅ SELECT   (all rows)                                   │
│    ✅ INSERT   (new rows)                                   │
│    ✅ UPDATE   (any row)                                    │
│    ✅ DELETE   (any row)                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## API Functions (RPC)

```
┌──────────────────────────────────────────────────────────────┐
│                    Supabase RPC Functions                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📖 READ Functions:                                          │
│    • get_models_catalog(category?, active_only?, limit?)     │
│    • get_model_by_id(id)                                     │
│    • search_models(search_term)                              │
│    • get_categories()                                        │
│                                                               │
│  ✏️ WRITE Functions:                                         │
│    • create_model(name, category, desc, filename, ...)       │
│    • update_model(id, updates...)                            │
│    • deactivate_model(id)  [Soft Delete]                     │
│    • delete_model(id)      [Hard Delete]                     │
│    • update_display_orders(json_array)                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Storage Structure

```
Supabase Storage
└── 3d-models/ (Public Bucket)
    ├── maskot-fm11.glb
    ├── Wali Kota Malang - Full Badan.glb
    ├── miniatur- (1).glb
    ├── miniatur- (2).glb
    ├── miniatur- (3).glb
    ├── miniatur- (4).glb
    └── miniatur- (5).glb

Public URL Format:
https://supabase.carubra.com/storage/v1/object/public/3d-models/{filename}

Access Control:
✅ Anyone can READ
✅ Authenticated users can UPLOAD
✅ Authenticated users can DELETE
```

---

## Frontend Architecture

```
src/
├── components/
│   ├── Catalog.tsx              # Public gallery view
│   ├── ModelCard.tsx            # Individual model card
│   ├── ModelViewer.tsx          # 3D viewer modal
│   └── AdminDashboard.tsx       # Admin CRUD interface
│
├── services/
│   └── catalogService.ts        # API wrapper functions
│       ├── getModelsCatalog()
│       ├── createModel()
│       ├── updateModel()
│       ├── deleteModel()
│       ├── uploadModelFile()
│       └── getModelFileUrl()
│
├── types/
│   ├── supabase.ts             # Database types
│   │   ├── ModelsCatalogRow
│   │   ├── ModelsCatalogFormatted
│   │   ├── CreateModelParams
│   │   └── UpdateModelParams
│   │
│   └── types.ts                # App types
│       └── Model3D
│
├── lib/
│   └── supabase.ts             # Supabase client config
│
└── utils/
    └── storage.ts              # Storage URL helpers
```

---

## Request Flow Example

### Example: Get All Active Models

```
1. User opens website
   ↓
2. Catalog component mounts
   ↓
3. useEffect calls loadModels()
   ↓
4. catalogService.getModelsCatalog({ activeOnly: true })
   ↓
5. supabase.rpc('get_models_catalog', { p_active_only: true })
   ↓
6. Supabase validates JWT token (if provided)
   ↓
7. RLS checks: Is user allowed to read?
   ↓
8. PostgreSQL executes function:
   SELECT * FROM models_catalog 
   WHERE is_active = true
   ORDER BY display_order
   ↓
9. Transform rows to JSON format
   ↓
10. Return to frontend
   ↓
11. Transform to Model3D[] interface
   ↓
12. React renders grid of ModelCard components
   ↓
13. Each card loads GLB from storage URL
   ↓
14. User sees 3D models ✅
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network                                            │
│    • HTTPS only                                              │
│    • CORS configured                                         │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication                                     │
│    • JWT token validation                                    │
│    • Supabase Auth                                           │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)                          │
│    • Policy checks per row                                   │
│    • Public: read active only                                │
│    • Authenticated: full CRUD                                │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Function Security                                  │
│    • SECURITY DEFINER functions                              │
│    • Input validation                                        │
│    • SQL injection protection                                │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Storage Policies                                   │
│    • Bucket-level access control                             │
│    • File upload restrictions                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

```
Development:
  Local Code → Git Push → GitHub
                            ↓
Production Database:
  Supabase Dashboard → SQL Editor → Run SQL Files
                            ↓
Storage Setup:
  Supabase Dashboard → Storage → Upload GLB Files
                            ↓
Frontend Deploy:
  GitHub → Vercel/Netlify → Production Website
                            ↓
Testing:
  Visit website → Models load from Supabase ✅
```

---

## Monitoring & Maintenance

```
Daily Operations:
  • Check logs in Supabase Dashboard
  • Monitor storage usage
  • Review RLS policy hits

Weekly:
  • Backup database (export to JSON)
  • Check for unused files in storage
  • Review inactive models

Monthly:
  • Performance optimization
  • Update dependencies
  • Security audit
```

---

**Last Updated:** 2026-08-09

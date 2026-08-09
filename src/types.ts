export interface Model3D {
  id: string;
  name: string;
  category: string;
  description?: string;
  modelPath: string;
  thumbnailPath?: string; // New field for static preview image
  
  preview?: {
    cameraPosition?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
  };

  viewer?: {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    cameraPosition?: [number, number, number];
  };
}

export interface ViewerSettings {
  autoRotate: boolean;
  showGrid: boolean;
  wireframe: boolean;
  lightingIntensity: number;
  background: 'dark' | 'light' | 'gradient';
}

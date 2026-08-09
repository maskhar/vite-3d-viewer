import { Model3D } from './types';
import { getModelUrl, getLocalModelUrl } from './utils/storage';

export const models: Model3D[] = [
  {
    id: '1',
    name: 'Maskot FM 11',
    category: 'Character',
    description: 'Futuristic space explorer',
    modelPath: getModelUrl('maskot-fm11.glb'), // Stored in Supabase (105.91 MB)
    preview: {
      cameraPosition: [0, 1, -2],
      scale: 0.6,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '2',
    name: 'Ketua Dikopinda Kota Malang',
    category: 'Character',
    description: 'Ketua Dikopinda Kota Malang',
    modelPath: getModelUrl('ketua-dikopinda-kota-malang.glb'), // Stored in Supabase (128.02 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '3',
    name: 'Sekretaris Daerah Provinsi Jawa Timur',
    category: 'Character',
    description: 'Sekretaris Daerah Provinsi Jawa Timur',
    modelPath: getLocalModelUrl('miniatur- (1).glb'), // Local (7.59 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '4',
    name: 'Menteri Pemuda dan Olahraga',
    category: 'Character',
    description: 'Menteri Pemuda dan Olahraga',
    modelPath: getLocalModelUrl('miniatur- (2).glb'), // Local (3.81 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '5',
    name: 'Ketua Dekopinda Kota Malang',
    category: 'Character',
    description: 'Ketua Dekopinda Kota Malang',
    modelPath: getLocalModelUrl('miniatur- (3).glb'), // Local (4.36 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '6',
    name: 'Ketua Dekopinwil Jawa Timur',
    category: 'Character',
    description: 'Ketua Dekopinwil Jawa Timur',
    modelPath: getLocalModelUrl('miniatur- (4).glb'), // Local (3.6 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
  {
    id: '7',
    name: 'Wali Kota Malang',
    category: 'Character',
    description: 'Wali Kota Malang',
    modelPath: getLocalModelUrl('miniatur- (5).glb'), // Local (3.17 MB)
    preview: {
      cameraPosition: [0, 1, 7],
      scale: 2,
    },
    viewer: {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      cameraPosition: [0, 1, 5],
    },
  },
];

import { Model3D } from './types';
import { getModelUrl } from './utils/storage';

export const models: Model3D[] = [
  {
    id: '1',
    name: 'Maskot FM 11',
    category: 'Character',
    description: 'Futuristic space explorer',
    modelPath: getModelUrl('maskot-fm11.glb'),
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
    name: 'Wali Kota Malang',
    category: 'Character',
    description: 'Wali Kota Malang',
    modelPath: getModelUrl('Wali Kota Malang - Full Badan.glb'),
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
    modelPath: getModelUrl('miniatur- (1).glb'),
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
    modelPath: getModelUrl('miniatur- (2).glb'),
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
    modelPath: getModelUrl('miniatur- (3).glb'),
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
    modelPath: getModelUrl('miniatur- (4).glb'),
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
    modelPath: getModelUrl('miniatur- (5).glb'),
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

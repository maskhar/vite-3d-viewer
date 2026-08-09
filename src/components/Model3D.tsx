import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DProps {
  modelPath: string;
  cameraPosition?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
}

const Model3DComponent: React.FC<Model3DProps> = ({
  modelPath,
  rotation = [0, 0, 0],
  scale = 1,
  autoRotate = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Use the hook unconditionally - drei handles caching internally
  const gltf = useGLTF(modelPath);

  useFrame((_state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!gltf || !gltf.scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
    );
  }

  return (
    <group ref={groupRef} rotation={rotation} scale={scale}>
      <primitive object={gltf.scene.clone()} />
    </group>
  );
};

// Preload models to avoid multiple loading attempts
export const preloadModel = (path: string) => {
  useGLTF.preload(path);
};

export default Model3DComponent;

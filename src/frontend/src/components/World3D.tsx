import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

export default function World3D() {
  const playerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (playerRef.current) {
      playerRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      {/* Ground */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#2d5016" />
      </Plane>

      {/* Player Character */}
      <group position={[0, 1, 0]}>
        <Sphere ref={playerRef} args={[0.5, 32, 32]} castShadow>
          <meshStandardMaterial color="#8b5cf6" />
        </Sphere>
      </group>

      {/* Environment Objects */}
      <Box position={[-5, 1, -5]} args={[2, 2, 2]} castShadow>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      <Box position={[5, 1, -5]} args={[2, 2, 2]} castShadow>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      <Box position={[-5, 1, 5]} args={[2, 2, 2]} castShadow>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      <Box position={[5, 1, 5]} args={[2, 2, 2]} castShadow>
        <meshStandardMaterial color="#4a5568" />
      </Box>

      {/* Trees */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        return (
          <group key={i} position={[x, 0, z]}>
            <Box args={[0.5, 3, 0.5]} position={[0, 1.5, 0]} castShadow>
              <meshStandardMaterial color="#654321" />
            </Box>
            <Sphere args={[1.5, 16, 16]} position={[0, 4, 0]} castShadow>
              <meshStandardMaterial color="#228b22" />
            </Sphere>
          </group>
        );
      })}
    </>
  );
}

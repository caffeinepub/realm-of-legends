import { Suspense } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import World3D from '../components/World3D';
import { Card } from '../components/ui/card';

export default function GamePage() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to enter the game world</p>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <World3D />
          <OrbitControls maxPolarAngle={Math.PI / 2} minDistance={5} maxDistance={50} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-slate-900/80 border-purple-800/50 p-4 backdrop-blur-sm">
          <p className="text-purple-200 text-sm font-semibold">Controls:</p>
          <p className="text-purple-300 text-xs">Mouse: Look around</p>
          <p className="text-purple-300 text-xs">Scroll: Zoom in/out</p>
        </Card>
      </div>
    </div>
  );
}

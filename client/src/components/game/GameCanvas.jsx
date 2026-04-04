import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Suspense } from 'react';
import NodeGrid from './NodeGrid.jsx';
import HUD from './HUD.jsx';
import './GameCanvas.css';

/**
 * Main game canvas — 3D space scene where objects fly TOWARD the player.
 * Camera faces forward into deep space.
 */
const GameCanvas = () => {
  return (
    <div className="game-canvas-wrapper" id="game-canvas">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020010']} />

        {/* Deep space fog for depth perception */}
        <fog attach="fog" args={['#020010', 30, 80]} />

        {/* Lighting — dramatic space lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 5, 10]} intensity={0.8} color="#6688ff" />
        <pointLight position={[0, 0, 10]} intensity={1.5} color="#4d9fff" distance={30} />
        <pointLight position={[-10, 5, -20]} intensity={0.6} color="#a855f7" distance={50} />
        <pointLight position={[10, -5, -30]} intensity={0.4} color="#00e5ff" distance={50} />

        {/* Animated star background — gives sense of motion */}
        <Stars
          radius={120}
          depth={80}
          count={5000}
          factor={6}
          saturation={0.3}
          fade
          speed={2}
        />

        {/* Space dust particles for extra depth */}
        <SpaceDust />

        <Suspense fallback={null}>
          <NodeGrid />
        </Suspense>
      </Canvas>

      {/* HUD overlay on top of canvas */}
      <HUD />
    </div>
  );
};

/**
 * Floating space dust particles to enhance depth perception.
 */
const SpaceDust = () => {
  const count = 200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = Math.random() * -60;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#aaaaff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

export default GameCanvas;

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../../store/gameStore.js';
import Node from './Node.jsx';

/**
 * Manages the game loop: spawning objects that fly TOWARD the camera
 * from deep space (z = -50) to the player (z = 15).
 */

const OBJECT_TYPES = [
  'asteroid', 'asteroid', 'asteroid', 'asteroid',
  'drone', 'drone',
  'energy',
  'stardust',
  'mine',
];

const NodeGrid = () => {
  const status = useGameStore((s) => s.status);
  const gameObjects = useGameStore((s) => s.gameObjects);
  const missionConfig = useGameStore((s) => s.missionConfig);
  const currentWave = useGameStore((s) => s.currentWave);
  const tick = useGameStore((s) => s.tick);
  const spawnObject = useGameStore((s) => s.spawnObject);
  const advanceWave = useGameStore((s) => s.advanceWave);
  const missObject = useGameStore((s) => s.missObject);

  const spawnTimerRef = useRef(0);

  useFrame((_, delta) => {
    if (status !== 'playing' || !missionConfig) return;

    // Update game timer
    tick(delta);

    // Spawn objects at intervals
    spawnTimerRef.current += delta;
    const baseInterval = 2.0;
    const speedFactor = missionConfig.speed || 1;
    const waveAcceleration = Math.min(currentWave * 0.05, 0.8);
    const spawnInterval = Math.max(0.5, baseInterval - waveAcceleration) / speedFactor;

    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;

      const { min, max } = missionConfig.objectsPerWave || { min: 2, max: 4 };
      const count = Math.floor(Math.random() * (max - min + 1)) + min;

      for (let i = 0; i < count; i++) {
        const type = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];

        // Spawn far away in 3D space — spread across X and Y
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 12;
        const z = -40 - Math.random() * 20; // Deep in space

        const speed = (1.5 + Math.random() * 1.5) * speedFactor;
        spawnObject(type, [x, y, z], speed);
      }

      advanceWave();
    }
  });

  const handleMiss = useCallback(
    (id, type) => {
      missObject(id, type);
    },
    [missObject]
  );

  return (
    <group>
      {/* Tunnel/path lines for depth reference */}
      <DepthGuides />

      {gameObjects.map((obj) => (
        <Node
          key={obj.id}
          id={obj.id}
          type={obj.type}
          position={obj.position}
          speed={obj.speed}
          onMiss={handleMiss}
        />
      ))}
    </group>
  );
};

/**
 * Subtle grid/tunnel lines to give a sense of 3D depth and motion.
 */
const DepthGuides = () => {
  const linesRef = useRef();

  // Create tunnel-like guide lines extending into the distance
  const points = [];
  const lineCount = 8;
  const radius = 14;

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(
      [x, y, 20],
      [x * 0.1, y * 0.1, -60]
    );
  }

  return (
    <group>
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i / lineCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([x, y, 20, x * 0.05, y * 0.05, -60])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#1a1a4a" transparent opacity={0.3} />
          </line>
        );
      })}

      {/* Cross rings at intervals for depth reference */}
      {[-10, -25, -40].map((z, i) => {
        const scale = 1 + (z + 40) / 40 * 0.8;
        return (
          <mesh key={`ring-${i}`} position={[0, 0, z]} rotation={[0, 0, 0]}>
            <ringGeometry args={[6 * scale, 6.1 * scale, 32]} />
            <meshBasicMaterial color="#1a1a5a" transparent opacity={0.15} side={2} />
          </mesh>
        );
      })}
    </group>
  );
};

export default NodeGrid;

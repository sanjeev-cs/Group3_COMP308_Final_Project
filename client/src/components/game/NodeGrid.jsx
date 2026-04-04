import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../../store/gameStore.js';
import Node from './Node.jsx';

/**
 * Manages spawning and positioning of game objects on the 3D grid.
 * Uses useFrame for the game loop (timer, spawning waves).
 */
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
  const objectTypes = ['asteroid', 'asteroid', 'asteroid', 'drone', 'energy', 'stardust', 'mine'];

  // Game loop — runs every frame
  useFrame((_, delta) => {
    if (status !== 'playing' || !missionConfig) return;

    // Update timer
    tick(delta);

    // Spawn new objects periodically
    spawnTimerRef.current += delta;
    const spawnInterval = Math.max(0.8, 2.5 - currentWave * 0.1 * (missionConfig.speed || 1));

    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;

      // Determine how many objects to spawn
      const { min, max } = missionConfig.objectsPerWave || { min: 2, max: 4 };
      const count = Math.floor(Math.random() * (max - min + 1)) + min;

      for (let i = 0; i < count; i++) {
        // Random type weighted toward asteroids
        const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];

        // Random position on a grid area
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 8;
        const y = 0.5;

        const speed = (0.5 + Math.random() * 0.5) * (missionConfig.speed || 1);
        spawnObject(type, [x, y, z], speed);
      }

      advanceWave();
    }
  });

  // Handle object timeout (auto-remove after lifetime)
  const handleMiss = useCallback(
    (id, type) => {
      missObject(id, type);
    },
    [missObject]
  );

  return (
    <group>
      {/* Grid floor lines for reference */}
      <gridHelper args={[20, 20, '#1a1a4a', '#0a0a2a']} position={[0, -0.5, 0]} />

      {/* Render active game objects */}
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

export default NodeGrid;

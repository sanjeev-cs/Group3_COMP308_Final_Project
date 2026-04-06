import { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore.js';
import Node from './Node.jsx';
import Explosion from './Explosion.jsx';

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
  const [explosions, setExplosions] = useState([]);

  useFrame((_, delta) => {
    if (status !== 'playing' || !missionConfig) return;

    tick(delta);

    spawnTimerRef.current += delta;
    const speedFactor = missionConfig.speed || 1;
    const waveAccel = Math.min(currentWave * 0.02, 0.4);
    const spawnInterval = Math.max(1.2, (3.0 - waveAccel) / speedFactor);

    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;

      const { min, max } = missionConfig.objectsPerWave || { min: 2, max: 4 };
      const count = Math.floor(Math.random() * (max - min + 1)) + min;

      for (let i = 0; i < count; i++) {
        const type = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
        const x = (Math.random() - 0.5) * 16;
        const y = (Math.random() - 0.5) * 9;
        const z = -20 - Math.random() * 15;
        const speed = (1.2 + Math.random() * 1.3) * speedFactor;
        spawnObject(type, [x, y, z], speed);
      }
      advanceWave();
    }
  });

  const handleMiss = useCallback((id, type) => { missObject(id, type); }, [missObject]);

  // When an object is hit → spawn explosion at that position
  const handleExplosion = useCallback((position, color) => {
    const id = Date.now() + Math.random();
    setExplosions((prev) => [...prev, { id, position, color }]);
    // Auto-remove after animation
    setTimeout(() => {
      setExplosions((prev) => prev.filter((e) => e.id !== id));
    }, 800);
  }, []);

  return (
    <group>
      {gameObjects.map((obj) => (
        <Node
          key={obj.id}
          id={obj.id}
          type={obj.type}
          position={obj.position}
          speed={obj.speed}
          onMiss={handleMiss}
          onExplosion={handleExplosion}
        />
      ))}

      {explosions.map((exp) => (
        <Explosion key={exp.id} position={exp.position} color={exp.color} />
      ))}
    </group>
  );
};

export default NodeGrid;

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Particle explosion burst.
 * Spawns particles outward from a position, fades, then removes itself.
 */
const PARTICLE_COUNT = 40;

const Explosion = ({ position, color }) => {
  const pointsRef = useRef();
  const [alive, setAlive] = useState(true);
  const ageRef = useRef(0);
  const maxAge = 0.7;

  // Create initial particle velocities and positions
  const { velocities, initialPositions } = useMemo(() => {
    const vels = [];
    const pos = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random direction — sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2 + Math.random() * 6;

      vels.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      // Start at explosion center
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];
    }

    return { velocities: vels, initialPositions: pos };
  }, [position]);

  const sizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      s[i] = 0.05 + Math.random() * 0.15;
    }
    return s;
  }, []);

  useFrame((_, delta) => {
    if (!alive || !pointsRef.current) return;

    ageRef.current += delta;
    const progress = ageRef.current / maxAge; // 0→1

    if (progress >= 1) {
      setAlive(false);
      return;
    }

    const posAttr = pointsRef.current.geometry.getAttribute('position');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posAttr.array[i * 3] += velocities[i * 3] * delta;
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * delta;
    }
    posAttr.needsUpdate = true;

    // Fade out
    pointsRef.current.material.opacity = 1 - progress;
    // Slow down
    for (let i = 0; i < velocities.length; i++) {
      velocities[i] *= 0.96;
    }
  });

  if (!alive) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={initialPositions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

export default Explosion;

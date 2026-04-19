import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const emberTrail = [
  { z: 0.55, scale: [0.52, 0.52, 1.15], opacity: 0.36, color: '#fb923c' },
  { z: 1.05, scale: [0.42, 0.42, 1.45], opacity: 0.26, color: '#f97316' },
  { z: 1.6, scale: [0.3, 0.3, 1.7], opacity: 0.18, color: '#ea580c' },
];

const FireballEffect = () => {
  const groupRef = useRef(null);
  const shellRef = useRef(null);
  const coreRef = useRef(null);
  const embers = useRef([]);
  const sparkData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => ({
        angle: (index / 7) * Math.PI * 2,
        radius: 0.22 + Math.random() * 0.18,
        z: 0.1 + Math.random() * 0.6,
        scale: 0.06 + Math.random() * 0.08,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 18) * 0.08;

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.08;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.95 + pulse * 0.08);
    }

    if (shellRef.current) {
      shellRef.current.scale.setScalar(1.05 + pulse * 0.12);
      shellRef.current.material.opacity = 0.22 + Math.sin(clock.elapsedTime * 10) * 0.04;
    }

    embers.current.forEach((ember, index) => {
      if (!ember) {
        return;
      }

      const wave = 1 + Math.sin(clock.elapsedTime * (12 + index * 1.7)) * 0.18;
      ember.scale.set(
        emberTrail[index].scale[0] * wave,
        emberTrail[index].scale[1] * wave,
        emberTrail[index].scale[2] * wave,
      );
      ember.position.x = Math.sin(clock.elapsedTime * (7 + index)) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial
          color="#fb923c"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial
          color="#fff7cc"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {emberTrail.map((flame, index) => (
        <mesh
          key={`ember-${index}`}
          ref={(element) => {
            embers.current[index] = element;
          }}
          position={[0, 0, flame.z]}
          scale={flame.scale}
        >
          <sphereGeometry args={[0.42, 14, 14]} />
          <meshBasicMaterial
            color={flame.color}
            transparent
            opacity={flame.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {sparkData.map((spark, index) => (
        <mesh
          key={`spark-${index}`}
          position={[
            Math.cos(spark.angle) * spark.radius,
            Math.sin(spark.angle) * spark.radius,
            spark.z,
          ]}
          scale={spark.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color="#fde68a"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default FireballEffect;

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 1400;
const RING_COUNT = 10;

const Stars = () => {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const data = new Float32Array(STAR_COUNT * 3);

    for (let index = 0; index < STAR_COUNT; index += 1) {
      const radius = 12 + Math.random() * 32;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 22;

      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = height;
      data[index * 3 + 2] = Math.sin(angle) * radius - 8;
    }

    return data;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y -= delta * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.06;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#dbeafe"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
};

const Rings = () => {
  const groupRef = useRef(null);
  const ringData = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, index) => ({
        radius: 6 + index * 1.85,
        z: -12 - index * 1.75,
        rotation: Math.random() * Math.PI * 2,
      })),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.z = state.clock.elapsedTime * 0.04;
    groupRef.current.rotation.x = -0.48 + Math.sin(state.clock.elapsedTime * 0.12) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 1.4, 0]}>
      {ringData.map((ring, index) => (
        <mesh key={`ring-${index}`} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotation]}>
          <torusGeometry args={[ring.radius, 0.045, 10, 96]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? '#38bdf8' : '#818cf8'}
            transparent
            opacity={0.2 - index * 0.012}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const Beams = () => {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -2.2, -8]}>
      <mesh rotation={[-0.2, 0.28, 0]}>
        <planeGeometry args={[16, 0.2]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[-0.2, -0.28, 0]}>
        <planeGeometry args={[16, 0.14]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const UiSceneBackground = () => (
  <Canvas camera={{ position: [0, 0, 18], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
    <color attach="background" args={['#050816']} />
    <fog attach="fog" args={['#050816', 12, 42]} />
    <ambientLight intensity={0.7} color="#d7e6ff" />
    <pointLight position={[8, 6, 10]} intensity={13} color="#38bdf8" distance={30} />
    <pointLight position={[-10, -4, 6]} intensity={9} color="#fb7185" distance={28} />
    <pointLight position={[0, -6, 12]} intensity={8} color="#fbbf24" distance={24} />
    <Stars />
    <Rings />
    <Beams />
  </Canvas>
);

export default UiSceneBackground;

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Volumetric nebula clouds — large transparent planes with
 * procedural gradient textures creating a deep space atmosphere.
 */
const Nebula = () => {
  const groupRef = useRef();

  // Create nebula cloud data
  const clouds = useMemo(() => {
    return [
      { pos: [-20, 8, -50], scale: [40, 25, 1], color: '#1a0533', opacity: 0.15, rot: 0.3 },
      { pos: [25, -5, -60], scale: [35, 20, 1], color: '#0a1533', opacity: 0.12, rot: -0.5 },
      { pos: [-10, -10, -70], scale: [50, 30, 1], color: '#0d0a2a', opacity: 0.1, rot: 0.8 },
      { pos: [15, 12, -45], scale: [30, 18, 1], color: '#1a0a33', opacity: 0.08, rot: -0.2 },
      { pos: [0, 0, -80], scale: [60, 40, 1], color: '#0a0a25', opacity: 0.18, rot: 0.1 },
    ];
  }, []);

  // Create gradient texture for nebula clouds
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Slow parallax drift
    const t = state.clock.elapsedTime * 0.02;
    groupRef.current.rotation.z = Math.sin(t) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.pos} rotation={[0, 0, cloud.rot]}>
          <planeGeometry args={cloud.scale} />
          <meshBasicMaterial
            color={cloud.color}
            map={nebulaTexture}
            transparent
            opacity={cloud.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Nebula;

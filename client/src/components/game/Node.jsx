import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../../store/gameStore.js';

/**
 * Individual 3D game object — asteroid, drone, energy orb, stardust, or mine.
 * Floats and pulses, clickable via R3F onClick.
 */

const TYPE_CONFIG = {
  asteroid: {
    color: '#8B7355',
    emissive: '#3d2b1a',
    geometry: 'icosahedron',
    scale: 0.5,
    detail: 1,
  },
  drone: {
    color: '#ef4444',
    emissive: '#aa0000',
    geometry: 'octahedron',
    scale: 0.45,
    detail: 0,
  },
  energy: {
    color: '#00e5ff',
    emissive: '#0088aa',
    geometry: 'sphere',
    scale: 0.35,
    detail: 16,
  },
  stardust: {
    color: '#ffd700',
    emissive: '#aa8800',
    geometry: 'dodecahedron',
    scale: 0.35,
    detail: 0,
  },
  mine: {
    color: '#ff2222',
    emissive: '#cc0000',
    geometry: 'tetrahedron',
    scale: 0.4,
    detail: 0,
  },
};

const Node = ({ id, type, position, speed, onMiss }) => {
  const meshRef = useRef();
  const hitObject = useGameStore((s) => s.hitObject);
  const status = useGameStore((s) => s.status);
  const [hovered, setHovered] = useState(false);
  const lifetimeRef = useRef(0);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.asteroid;

  // Lifetime — auto-remove after some seconds
  const maxLifetime = 5 / speed;

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing') return;

    lifetimeRef.current += delta;

    // Floating animation
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2 + id) * 0.3;

    // Rotation
    meshRef.current.rotation.x += delta * 0.5 * speed;
    meshRef.current.rotation.y += delta * 0.8 * speed;

    // Pulse scale on hover
    const targetScale = hovered ? config.scale * 1.3 : config.scale;
    meshRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale },
      0.1
    );

    // Remove if lifetime exceeded
    if (lifetimeRef.current >= maxLifetime) {
      onMiss(id, type);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (status !== 'playing') return;
    hitObject(id, type);
  };

  const getGeometry = () => {
    switch (config.geometry) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, config.detail]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, config.detail]} />;
      case 'sphere':
        return <sphereGeometry args={[1, config.detail, config.detail]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, config.detail]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[1, config.detail]} />;
      default:
        return <sphereGeometry args={[1, 16, 16]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={config.scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={config.color}
        emissive={config.emissive}
        emissiveIntensity={hovered ? 2 : 1}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
};

export default Node;

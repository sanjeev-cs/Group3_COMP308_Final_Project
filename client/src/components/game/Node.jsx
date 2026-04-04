import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore.js';

/**
 * Individual 3D game object that flies TOWARD the camera.
 * Appears small in the distance, grows as it approaches.
 * Clickable via R3F raycasting. Explosion particle burst on destroy.
 */

const TYPE_CONFIG = {
  asteroid: {
    color: '#8B7355',
    emissive: '#5a3a1a',
    emissiveIntensity: 0.5,
    geometry: 'icosahedron',
    baseScale: 0.7,
    rotationSpeed: 1.5,
  },
  drone: {
    color: '#ff4444',
    emissive: '#cc0000',
    emissiveIntensity: 1.0,
    geometry: 'octahedron',
    baseScale: 0.55,
    rotationSpeed: 3,
  },
  energy: {
    color: '#00e5ff',
    emissive: '#0099cc',
    emissiveIntensity: 1.5,
    geometry: 'sphere',
    baseScale: 0.45,
    rotationSpeed: 1,
  },
  stardust: {
    color: '#ffd700',
    emissive: '#cc9900',
    emissiveIntensity: 2,
    geometry: 'dodecahedron',
    baseScale: 0.5,
    rotationSpeed: 2,
  },
  mine: {
    color: '#ff0033',
    emissive: '#ff0000',
    emissiveIntensity: 1.5,
    geometry: 'tetrahedron',
    baseScale: 0.5,
    rotationSpeed: 4,
  },
};

const Node = ({ id, type, position, speed, onMiss }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const hitObject = useGameStore((s) => s.hitObject);
  const status = useGameStore((s) => s.status);
  const [hovered, setHovered] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.asteroid;

  // Track current z position via ref (no re-renders)
  const posRef = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (destroyed || !meshRef.current || status !== 'playing') return;

    // Move TOWARD camera (increase z)
    posRef.current.z += speed * delta * 8;
    meshRef.current.position.copy(posRef.current);

    // Subtle floating motion on X and Y
    meshRef.current.position.x += Math.sin(state.clock.elapsedTime * 1.5 + id * 0.7) * delta * 0.3;
    meshRef.current.position.y += Math.cos(state.clock.elapsedTime * 1.2 + id * 1.3) * delta * 0.2;

    // Rotate for 3D feel
    meshRef.current.rotation.x += delta * config.rotationSpeed;
    meshRef.current.rotation.y += delta * config.rotationSpeed * 0.7;
    meshRef.current.rotation.z += delta * config.rotationSpeed * 0.3;

    // Hover scale effect
    const targetScale = hovered ? config.baseScale * 1.4 : config.baseScale;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.15
    );

    // Glow ring follows mesh
    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position);
      glowRef.current.lookAt(state.camera.position);
      const glowScale = hovered ? config.baseScale * 2.5 : config.baseScale * 2;
      glowRef.current.scale.lerp(
        new THREE.Vector3(glowScale, glowScale, 1),
        0.15
      );
    }

    // Object passed the camera — missed!
    if (posRef.current.z > 18) {
      onMiss(id, type);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (status !== 'playing' || destroyed) return;
    setDestroyed(true);
    hitObject(id, type);
  };

  if (destroyed) return null;

  const getGeometry = () => {
    switch (config.geometry) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 1]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'sphere':
        return <sphereGeometry args={[1, 16, 16]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[1, 0]} />;
      default:
        return <sphereGeometry args={[1, 16, 16]} />;
    }
  };

  return (
    <group>
      {/* Main mesh */}
      <mesh
        ref={meshRef}
        position={position}
        scale={config.baseScale}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'crosshair';
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
          emissiveIntensity={hovered ? config.emissiveIntensity * 2 : config.emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Glow sprite behind the object */}
      <sprite ref={glowRef} position={position} scale={[config.baseScale * 2, config.baseScale * 2, 1]}>
        <spriteMaterial
          color={config.emissive}
          transparent
          opacity={hovered ? 0.6 : 0.25}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};

export default Node;

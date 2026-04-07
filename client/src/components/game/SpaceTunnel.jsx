import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VISUAL_RADIUS = 24;
const VISUAL_LENGTH = 360;
const RING_COUNT = 24;
const STREAK_COUNT = 160;
const RING_RESET_Z = -14;
const STREAK_RESET_Z = -8;

const createTunnelTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  context.fillStyle = '#01030a';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const baseGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  baseGradient.addColorStop(0, '#020611');
  baseGradient.addColorStop(0.5, '#08111f');
  baseGradient.addColorStop(1, '#020611');
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 60; i += 1) {
    const laneX = (i / 60) * canvas.width;
    const laneWidth = 4 + Math.random() * 12;
    const laneGlow = context.createLinearGradient(laneX, 0, laneX + laneWidth, 0);
    laneGlow.addColorStop(0, 'rgba(34, 211, 238, 0)');
    laneGlow.addColorStop(0.5, 'rgba(96, 165, 250, 0.32)');
    laneGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
    context.fillStyle = laneGlow;
    context.fillRect(laneX, 0, laneWidth, canvas.height);
  }

  for (let i = 0; i < 260; i += 1) {
    const streakX = Math.random() * canvas.width;
    const streakY = Math.random() * canvas.height;
    const streakWidth = 1 + Math.random() * 3;
    const streakHeight = 24 + Math.random() * 140;
    const streakGradient = context.createLinearGradient(0, streakY, 0, streakY + streakHeight);
    streakGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGradient.addColorStop(0.35, 'rgba(125, 211, 252, 0.22)');
    streakGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = streakGradient;
    context.fillRect(streakX, streakY, streakWidth, streakHeight);
  }

  for (let i = 0; i < 1200; i += 1) {
    const sparkX = Math.random() * canvas.width;
    const sparkY = Math.random() * canvas.height;
    const sparkSize = Math.random() * 2.4;
    const alpha = 0.18 + Math.random() * 0.75;

    context.fillStyle = Math.random() > 0.82 ? `rgba(125, 211, 252, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    context.beginPath();
    context.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8, 5.5);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

const buildRingData = () =>
  Array.from({ length: RING_COUNT }, (_, index) => ({
    z: -(index / RING_COUNT) * VISUAL_LENGTH,
    speed: 18 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    thickness: 0.08 + Math.random() * 0.12,
    radius: VISUAL_RADIUS - 2.6 - Math.random() * 0.9,
    color: index % 3 === 0 ? '#e2e8f0' : index % 2 === 0 ? '#7dd3fc' : '#60a5fa',
  }));

const buildStreakData = () =>
  Array.from({ length: STREAK_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 10 + Math.random() * (VISUAL_RADIUS - 14),
    z: -Math.random() * VISUAL_LENGTH,
    speed: 35 + Math.random() * 35,
    width: 0.05 + Math.random() * 0.14,
    length: 1.8 + Math.random() * 5,
  }));

const TunnelWall = () => {
  const tunnelTexture = useMemo(createTunnelTexture, []);
  const shellRef = useRef(null);

  useFrame((_, delta) => {
    const material = shellRef.current?.material;
    if (!material?.map) {
      return;
    }

    material.map.offset.y = (material.map.offset.y - delta * 1.7) % 1;
  });

  return (
    <mesh ref={shellRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[VISUAL_RADIUS, VISUAL_RADIUS, VISUAL_LENGTH, 96, 1, true]} />
      <meshBasicMaterial
        map={tunnelTexture}
        side={THREE.BackSide}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

const TunnelRings = () => {
  const ringRefs = useRef([]);
  const ringData = useMemo(buildRingData, []);

  useFrame((_, delta) => {
    ringRefs.current.forEach((ringMesh, index) => {
      if (!ringMesh) {
        return;
      }

      const ring = ringData[index];
      ring.z += ring.speed * delta;
      ring.rotation += delta * 0.22;

      if (ring.z > RING_RESET_Z) {
        ring.z -= VISUAL_LENGTH + RING_RESET_Z;
      }

      ringMesh.position.z = ring.z;
      ringMesh.rotation.z = ring.rotation;
    });
  });

  return ringData.map((ring, index) => (
    <mesh
      key={`ring-${index}`}
      ref={(element) => {
        ringRefs.current[index] = element;
      }}
      position={[0, 0, ring.z]}
      rotation={[0, 0, ring.rotation]}
    >
      <torusGeometry args={[ring.radius, ring.thickness, 14, 96]} />
      <meshBasicMaterial
        color={ring.color}
        transparent
        opacity={0.36}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  ));
};

const TunnelStreaks = () => {
  const streakMeshRef = useRef(null);
  const streakData = useMemo(buildStreakData, []);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!streakMeshRef.current) {
      return;
    }

    streakData.forEach((streak, index) => {
      streak.z += streak.speed * delta;

      if (streak.z > STREAK_RESET_Z) {
        streak.z = -VISUAL_LENGTH;
        streak.angle = Math.random() * Math.PI * 2;
        streak.radius = 10 + Math.random() * (VISUAL_RADIUS - 14);
        streak.speed = 35 + Math.random() * 35;
        streak.width = 0.05 + Math.random() * 0.14;
        streak.length = 1.8 + Math.random() * 5;
      }

      helper.position.set(
        Math.cos(streak.angle) * streak.radius,
        Math.sin(streak.angle) * streak.radius,
        streak.z,
      );
      helper.scale.set(streak.width, streak.width, streak.length);
      helper.updateMatrix();
      streakMeshRef.current.setMatrixAt(index, helper.matrix);
    });

    streakMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={streakMeshRef} args={[null, null, STREAK_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#93c5fd"
        transparent
        opacity={0.72}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};

const SpaceTunnel = () => (
  <group>
    <TunnelWall />
    <TunnelRings />
    <TunnelStreaks />
  </group>
);

export default SpaceTunnel;

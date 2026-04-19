import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Clone, useAnimations, Center } from '@react-three/drei';
import * as THREE from 'three';
import useGameplayState from '../state/useGameplayState.js';
import HUD from './HUD.jsx';
import FireballEffect from './FireballEffect.jsx';
import SpaceTunnel from './SpaceTunnel.jsx';
import { clampToBounds, getVisibleMovementBounds, hasProjectileHit } from '../utils/gameSceneMath.js';
import { playEnemyDestroyedSound, playLaserSound, playShipImpactSound, resumeGameAudio } from '../audio/gameSoundManager.js';
import './GameCanvas.css';

// ─── TUNNEL SETTINGS ────────────────────────────────
const TUNNEL_RADIUS = 12;
const SHIP_Z = 5;
const CROSSHAIR_Z = -40;
const SPAWN_Z = -200;
const MISS_Z = 15;
const SMOOTH = 0.12;
const MOVEMENT_BOUND = TUNNEL_RADIUS - 1.5;
const GAME_MODEL_PATHS = [
  '/models/spaceship.glb',
  '/models/fireball.glb',
  '/models/meteor.glb',
  '/models/mine.glb',
  '/models/ghost_boy.glb',
  '/models/king_boo.glb',
  '/models/angrybird_red.glb',
  '/models/angrybird_chuck.glb',
];

// ─── THE SPACE TUNNEL ENVIRONMENT ───────────────────────
// ─── PLAYER SHIP ──────────────────────────────────
const Ship = ({ targetRef, positionRef }) => {
  const group = useRef();
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  // We use useGLTF without caching locally for simplicity. It handles its own caching.
  const { scene } = useGLTF('/models/spaceship.glb');
  const clone = useMemo(() => scene.clone(true), [scene]);
  const vel = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!isPlaying) return;
    if (!group.current) return;
    const g = group.current;
    const bounds = getVisibleMovementBounds(state.viewport, state.camera, SHIP_Z, MOVEMENT_BOUND);

    clampToBounds(targetRef.current, bounds);
    
    vel.current.x += (targetRef.current.x - g.position.x) * SMOOTH;
    vel.current.y += (targetRef.current.y - g.position.y) * SMOOTH;
    vel.current.x *= 0.82;
    vel.current.y *= 0.82;
    
    g.position.x += vel.current.x;
    g.position.y += vel.current.y;
    g.position.z = SHIP_Z;

    const unclampedX = g.position.x;
    const unclampedY = g.position.y;
    clampToBounds(g.position, bounds);
    if (g.position.x !== unclampedX) vel.current.x = 0;
    if (g.position.y !== unclampedY) vel.current.y = 0;
    positionRef.current.copy(g.position);

    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -vel.current.x * 0.4, 0.1);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, vel.current.y * 0.2, 0.1);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, vel.current.x * 0.1, 0.1);
  });

  return (
    <group ref={group}>
      <primitive object={clone} scale={0.4} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

const Crosshair3D = ({ posRef }) => {
  const ref = useRef();
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  useFrame(() => {
    if (!isPlaying) return;
    if (ref.current) {
      ref.current.position.copy(posRef.current);
    }
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.3, 0.4, 32]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} depthTest={false} />
    </mesh>
  );
};

// ─── BULLETS & COMBAT ─────────────────────────────
const BULLET_SPEED = 150;
const DEFAULT_WEAPON = { cooldown: 0.3, projectiles: 1, spread: 0, depthStep: 0 };
const TYPES = {
  meteor:    { color: '#78716c', scale: 1.8 },
  mine:      { color: '#f59e0b', scale: 0.8 },
  ghost_boy: { color: '#ef4444', scale: 1.0 }, 
  king_boo:  { color: '#34d399', scale: 0.005 },
  boss:      { color: '#ef4444', scale: 1.22 },
  red:       { color: '#ef4444', scale: 1.22 },
  chuck:     { color: '#fcd34d', scale: 3.7 },
};

const getBurstOffsets = (count) => Array.from({ length: count }, (_, index) => index - (count - 1) / 2);

const createProjectilePattern = (baseDirection, projectileCount, spread, depthStep) => {
  const offsets = getBurstOffsets(projectileCount);

  if (projectileCount <= 1) {
    return [{ direction: baseDirection.clone(), depthOffset: 0 }];
  }

  if (spread <= 0) {
    return Array.from({ length: projectileCount }, (_, index) => ({
      direction: baseDirection.clone(),
      depthOffset: index * depthStep,
    }));
  }

  const worldUp = new THREE.Vector3(0, 1, 0);
  const lateralAxis = new THREE.Vector3().crossVectors(baseDirection, worldUp);
  if (lateralAxis.lengthSq() < 0.0001) {
    lateralAxis.set(1, 0, 0);
  }
  lateralAxis.normalize();

  return offsets.map((offset) => ({
    direction: baseDirection.clone().addScaledVector(lateralAxis, offset * spread).normalize(),
    depthOffset: Math.abs(offset) * depthStep,
  }));
};

const BulletModel = () => {
  const gltf = useGLTF('/models/fireball.glb');
  const clone = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#ffd166',
          emissive: '#ff6a00',
          emissiveIntensity: 2.4,
          roughness: 0.18,
          metalness: 0.05,
        });
      }
    });
    return c;
  }, [gltf.scene]);
  return <primitive object={clone} scale={0.2} rotation={[Math.PI / 2, 0, 0]} />;
};

const Bullet = ({ id, x, y, z, direction, onDone, registerTarget }) => {
  const ref = useRef();
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  const travelDirection = useMemo(
    () => new THREE.Vector3(direction[0], direction[1], direction[2]).normalize(),
    [direction],
  );
  
  useEffect(() => {
    registerTarget(id, ref.current);
    return () => registerTarget(id, null);
  }, [id, registerTarget]);

  useFrame((_, d) => {
    if (!isPlaying) return;
    if (!ref.current) return;
    ref.current.position.addScaledVector(travelDirection, BULLET_SPEED * d);
    if (ref.current.position.z < SPAWN_Z) onDone(id);
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      <FireballEffect />
      <BulletModel />
    </group>
  );
};

// ─── DYNAMIC MODEL LOADERS ───────────────────────
const AsteroidModel = ({ scale }) => { const { scene } = useGLTF('/models/meteor.glb'); return <Center><Clone object={scene} scale={scale} /></Center>; };
const GhostModel = ({ scale }) => { 
  const { scene, animations } = useGLTF('/models/ghost_boy.glb'); 
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const keys = Object.keys(actions);
      let target = keys.find(k => k.toLowerCase().includes('fly') || k.toLowerCase().includes('float') || k.toLowerCase().includes('run') || k.toLowerCase().includes('walk'));
      if (!target) target = keys[0];
      actions[target].reset().play();
    }
  }, [actions]);

  return <group ref={group}><Center><Clone object={scene} scale={scale} /></Center></group>; 
};
const MineModel     = ({ scale }) => { const { scene } = useGLTF('/models/mine.glb'); return <Center><Clone object={scene} scale={scale} /></Center>; };
const AlienModel = ({ scale }) => { 
  const { scene, animations } = useGLTF('/models/king_boo.glb'); 
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const keys = Object.keys(actions);
      let target = keys.find(k => k.toLowerCase().includes('dance') || k.toLowerCase().includes('fly') || k.toLowerCase().includes('attack'));
      if (!target) target = keys[0];
      actions[target].reset().play();
    }
  }, [actions]);

  return <group ref={group}><Center><Clone object={scene} scale={scale} /></Center></group>; 
};

const RedModel = ({ scale }) => { 
  const { scene, animations } = useGLTF('/models/angrybird_red.glb'); 
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const keys = Object.keys(actions);
      let target = keys.find(k => k.toLowerCase().includes('attack') || k.toLowerCase().includes('hit'));
      if (!target) target = keys[0];
      actions[target].reset().play();
    }
  }, [actions]);

  return <group ref={group}><Center><Clone object={scene} scale={scale} /></Center></group>; 
};

const ChuckModel    = ({ scale }) => { const { scene } = useGLTF('/models/angrybird_chuck.glb'); return <Center><Clone object={scene} scale={scale} /></Center>; };

const Enemy = ({ id, type, px, py, pz, speed, onMiss, registerTarget }) => {
  const ref = useRef();
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  const normalizedType = ['red', 'angrybird_red'].includes(type) ? 'boss' : type;
  const cfg = TYPES[normalizedType] || TYPES.meteor;
  const alive = useRef(true);

  useEffect(() => {
    registerTarget(id, ref.current);
    return () => registerTarget(id, null);
  }, [id, registerTarget]);

  useEffect(() => {
    if (ref.current) {
      ref.current.userData.type = normalizedType;
      ref.current.userData.speed = speed;
    }
  }, [normalizedType, speed]);

  const ModelNode = useMemo(() => {
    switch (normalizedType) {
      case 'ghost_boy': return <GhostModel scale={cfg.scale} />;
      case 'mine':      return <MineModel scale={cfg.scale} />;
      case 'king_boo':  return <AlienModel scale={cfg.scale} />;
      case 'boss':      return <RedModel scale={cfg.scale} />;
      case 'chuck':     return <ChuckModel scale={cfg.scale} />;
      default:          return <AsteroidModel scale={cfg.scale} />;
    }
  }, [normalizedType, cfg.scale]);

  useFrame((state, d) => {
    if (!isPlaying) return;
    if (!ref.current || !alive.current) return;
    ref.current.position.z += speed * d * 8;
    
    ref.current.position.x += Math.sin(state.clock.elapsedTime * 2 + id) * d * 2;
    ref.current.position.y += Math.cos(state.clock.elapsedTime * 1.5 + id) * d * 2;

    const dist = Math.sqrt(ref.current.position.x**2 + ref.current.position.y**2);
    if (dist > MOVEMENT_BOUND) {
      ref.current.position.x *= (MOVEMENT_BOUND/dist);
      ref.current.position.y *= (MOVEMENT_BOUND/dist);
    }

    if (normalizedType === 'meteor' || normalizedType === 'mine') {
      ref.current.rotation.x += d * 2;
      ref.current.rotation.y += d;
    }

    if (normalizedType === 'boss') {
      ref.current.lookAt(state.camera.position);
      ref.current.rotateY(Math.PI);
    }

    if (normalizedType === 'king_boo') {
      ref.current.lookAt(state.camera.position);
    }

    if (ref.current.position.z > MISS_Z) {
      alive.current = false;
      onMiss(id, type);
    }
  });

  return (
    <group ref={ref} position={[px,py,pz]}>
      {ModelNode}
      {normalizedType === 'boss' ? <pointLight color={cfg.color} intensity={1.25} distance={4} /> : null}
    </group>
  );
};

const Boom = ({ x, y, z, color }) => {
  const ref = useRef();
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  const age = useRef(0);
  const [alive, setAlive] = useState(true);
  const N = 15;

  const { vels, initPos } = useMemo(() => {
    const v = new Float32Array(N * 3);
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 5 + Math.random() * 12;
        v[i*3]   = Math.sin(ph)*Math.cos(th)*sp;
        v[i*3+1] = Math.sin(ph)*Math.sin(th)*sp;
        v[i*3+2] = Math.cos(ph)*sp;
        p[i*3] = x; p[i*3+1] = y; p[i*3+2] = z;
    }
    return { vels: v, initPos: p };
  }, [x,y,z]);

  useFrame((_, d) => {
    if (!isPlaying) return;
    if (!ref.current || !alive) return;
    age.current += d;
    if (age.current > 0.6) { setAlive(false); return; }
    const a = ref.current.geometry.getAttribute('position');
    for (let i = 0; i < N; i++) {
      a.array[i*3]   += vels[i*3]*d;
      a.array[i*3+1] += vels[i*3+1]*d;
      a.array[i*3+2] += vels[i*3+2]*d;
    }
    a.needsUpdate = true;
    ref.current.material.opacity = 1 - (age.current / 0.6);
  });

  if (!alive) return null;
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={N} array={initPos} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.35} color={color} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

// ─── GAME LOGIC MGR ───────────────────────────────

const GameLogic = ({ shipPos, aimPos }) => {
  const status = useGameplayState(s=>s.status);
  const cfg    = useGameplayState(s=>s.missionConfig);
  const spawn  = useGameplayState(s=>s.spawnObject);
  const hit    = useGameplayState(s=>s.hitObject);
  const miss   = useGameplayState(s=>s.missObject);
  const tick   = useGameplayState(s=>s.tick);
  const adv    = useGameplayState(s=>s.advanceWave);
  const objs   = useGameplayState(s=>s.gameObjects);
  const objectIndex = useMemo(
    () => new Map(objs.map((object) => [object.id, object])),
    [objs],
  );

  const [bullets, setBullets] = useState([]);
  const [booms, setBooms]     = useState([]);
  const firing = useRef(false);
  const stRef  = useRef(0);
  const cdRef  = useRef(0);
  const burstShotsRemaining = useRef(0);
  const burstIntervalRef = useRef(0);
  const queuedDirectionRef = useRef(new THREE.Vector3(0, 0, -1));
  const queuedOriginRef = useRef(new THREE.Vector3(0, 0, SHIP_Z));

  const activeBullets = useRef({});
  const activeEnemies = useRef({});
  const spentBulletIds = useRef(new Set());

  const regBullet = useCallback((id, mesh) => {
    if (mesh) {
      mesh.visible = true;
      mesh.userData.spent = false;
      activeBullets.current[id] = mesh;
    }
    else delete activeBullets.current[id];
  }, []);

  const regEnemy = useCallback((id, mesh) => {
    if (mesh) activeEnemies.current[id] = mesh;
    else delete activeEnemies.current[id];
  }, []);

  useEffect(() => {
    const md = () => {
      resumeGameAudio();
      firing.current = true;
    };
    const mu = () => { firing.current = false; };
    window.addEventListener('mousedown', md);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousedown',md); window.removeEventListener('mouseup',mu); };
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      spentBulletIds.current.clear();
    }
  }, [status]);

  const triggerBoom = useCallback((x,y,z, col) => {
    const id = Date.now()+Math.random();
    setBooms(p => [...p, { id, x,y,z, color: col }]);
    setTimeout(() => setBooms(p => p.filter(e => e.id !== id)), 800);
  }, []);

  const rmBul = useCallback(id => {
    spentBulletIds.current.add(id);
    if (activeBullets.current[id]) {
      activeBullets.current[id].visible = false;
      activeBullets.current[id].userData.spent = true;
    }
    setBullets(p => p.filter(b=>b.id!==id));
    delete activeBullets.current[id];
  }, []);

  useFrame((_, d) => {
    if (status !== 'playing' || !cfg) return;
    tick(d);

    const weapon = cfg.weapon || DEFAULT_WEAPON;

    cdRef.current -= d;
    burstIntervalRef.current -= d;

    if (firing.current && cdRef.current <= 0 && burstShotsRemaining.current <= 0) {
      cdRef.current = weapon.cooldown;
      queuedOriginRef.current.copy(shipPos.current);
      queuedDirectionRef.current.copy(aimPos.current).sub(shipPos.current).normalize();
      burstShotsRemaining.current = weapon.projectiles || 1;
      burstIntervalRef.current = 0;
    }

    if (burstShotsRemaining.current > 0 && burstIntervalRef.current <= 0) {
      const direction = queuedDirectionRef.current.clone();
      const origin = queuedOriginRef.current.clone();

      playLaserSound();
      setBullets((current) => [
        ...current,
        {
          id: Date.now() + Math.random(),
          x: origin.x,
          y: origin.y,
          z: origin.z,
          direction: [direction.x, direction.y, direction.z],
        },
      ]);

      burstShotsRemaining.current -= 1;
      burstIntervalRef.current = burstShotsRemaining.current > 0 ? (weapon.burstInterval || 0.08) : 0;
    }

    for (const eId in activeEnemies.current) {
      const eMesh = activeEnemies.current[eId];
      if (!eMesh) continue;
      
      const ePos = eMesh.position;
      const enemyData = objectIndex.get(Number(eId));
      let hitBulletId = null;

      for (const bId in activeBullets.current) {
        const bulletId = Number(bId);
        if (spentBulletIds.current.has(bulletId)) continue;

        const bMesh = activeBullets.current[bId];
        if (!bMesh || bMesh.userData.spent) continue;
        if (hasProjectileHit({
          bulletPosition: bMesh.position,
          enemyPosition: ePos,
          bulletSpeed: BULLET_SPEED,
          enemySpeed: enemyData?.speed ?? eMesh.userData.speed ?? 0,
          delta: d,
          enemyType: enemyData?.type ?? eMesh.userData.type,
        })) {
          hitBulletId = bulletId;
          break;
        }
      }

      if (hitBulletId !== null) {
        spentBulletIds.current.add(hitBulletId);
        if (activeBullets.current[hitBulletId]) {
          activeBullets.current[hitBulletId].visible = false;
          activeBullets.current[hitBulletId].userData.spent = true;
          delete activeBullets.current[hitBulletId];
        }

        if (enemyData) {
            const hitResult = hit(Number(eId), enemyData.type);
            if (hitResult?.destroyed) {
              triggerBoom(ePos.x, ePos.y, ePos.z, TYPES[enemyData.type]?.color || '#ffffff');
              playEnemyDestroyedSound();
              delete activeEnemies.current[eId];
            }
        }
        rmBul(hitBulletId);
        continue;
      }

      const distToShipSq = ePos.distanceToSquared(shipPos.current);
      if (distToShipSq < 4.0) {
         triggerBoom(ePos.x, ePos.y, ePos.z, '#ef4444');
         playShipImpactSound();
         miss(Number(eId), enemyData?.type ?? eMesh.userData.type);
         delete activeEnemies.current[eId];
      }
    }

    stRef.current += d;
    if (stRef.current > (cfg.spawnInterval || 1.0) && objs.length < (cfg.maxActiveEnemies || 3)) {
      stRef.current = 0;
      const P = cfg.pool || ['meteor', 'mine'];
      const availableSlots = Math.max(1, (cfg.maxActiveEnemies || 3) - objs.length);
      const minSpawn = cfg.objectsPerWave?.min || 1;
      const maxSpawn = cfg.objectsPerWave?.max || minSpawn;
      const spawnCount = Math.min(
        availableSlots,
        minSpawn + Math.floor(Math.random() * (maxSpawn - minSpawn + 1)),
      );

      for (let index = 0; index < spawnCount; index += 1) {
        const type = P[Math.floor(Math.random() * P.length)];
        const r = Math.random() * MOVEMENT_BOUND;
        const th = Math.random() * Math.PI * 2;

        let speedMult = 2;
        if (type === 'ghost_boy') speedMult = 2.4;
        if (type === 'king_boo') speedMult = 2.7;
        if (type === 'chuck') speedMult = 6.9;
        if (type === 'boss' || type === 'red' || type === 'angrybird_red') speedMult = 1.15;

        spawn(type, [r * Math.cos(th), r * Math.sin(th), SPAWN_Z], speedMult + Math.random() * (cfg.speed || 1));
      }
      adv();
    }
  });

  return (
    <>
      {objs.map(o => (
        <Enemy key={o.id} id={o.id} type={o.type} px={o.position[0]} py={o.position[1]} pz={o.position[2]} speed={o.speed} 
               onMiss={miss} registerTarget={regEnemy} />
      ))}
      {bullets.map(b => (
        <Bullet
          key={b.id}
          id={b.id}
          x={b.x}
          y={b.y}
          z={b.z}
          direction={b.direction}
          onDone={rmBul}
          registerTarget={regBullet}
        />
      ))}
      {booms.map(b => <Boom key={b.id} x={b.x} y={b.y} z={b.z} color={b.color} />)}
    </>
  );
};

// ─── MOUSE LISTENER ───────────────────────────────
const MouseControls = ({ shipTargetRef, aimRef, pointerRef }) => {
  const isPlaying = useGameplayState((state) => state.status === 'playing');
  useFrame(({ mouse, camera, viewport }) => {
    if (!isPlaying) return;
    const shipBounds = getVisibleMovementBounds(viewport, camera, SHIP_Z, MOVEMENT_BOUND);
    const aimBounds = getVisibleMovementBounds(viewport, camera, CROSSHAIR_Z, TUNNEL_RADIUS - 0.8, { x: 0.6, y: 0.6 });
    const pointer = pointerRef.current || mouse;

    if (shipTargetRef.current) {
      shipTargetRef.current.set(pointer.x * shipBounds.x, pointer.y * shipBounds.y, SHIP_Z);
      clampToBounds(shipTargetRef.current, shipBounds);
    }

    if (aimRef.current) {
      aimRef.current.set(pointer.x * aimBounds.x, pointer.y * aimBounds.y, CROSSHAIR_Z);
    }
  });
  return null;
};

// ══════════════════════════════════════════════════
const SceneReady = ({ onReady }) => {
  const notified = useRef(false);

  useFrame(() => {
    if (!onReady || notified.current) return;
    notified.current = true;
    onReady();
  });

  return null;
};

const GameCanvas = ({ onReady, className = '' }) => {
  const wrapperRef = useRef(null);
  const shipTarget = useRef(new THREE.Vector3(0, 0, SHIP_Z));
  const shipPos = useRef(new THREE.Vector3(0, 0, SHIP_Z));
  const aimPos = useRef(new THREE.Vector3(0, 0, CROSSHAIR_Z));
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerLockedRef = useRef(false);
  const [pointerLocked, setPointerLocked] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const clampPointer = () => {
      pointerRef.current.x = THREE.MathUtils.clamp(pointerRef.current.x, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(pointerRef.current.y, -1, 1);
    };

    const updateFromClientPosition = (event) => {
      if (pointerLockedRef.current) return;
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      clampPointer();
    };

    const updateLockedPointer = (event) => {
      if (!pointerLockedRef.current) return;
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointerRef.current.x += (event.movementX / rect.width) * 2;
      pointerRef.current.y -= (event.movementY / rect.height) * 2;
      clampPointer();
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === wrapper;
      pointerLockedRef.current = locked;
      setPointerLocked(locked);
    };

    const requestLock = () => {
      if (document.pointerLockElement !== wrapper) {
        wrapper.requestPointerLock?.();
      }
    };

    wrapper.addEventListener('mousemove', updateFromClientPosition);
    wrapper.addEventListener('mousedown', requestLock);
    document.addEventListener('mousemove', updateLockedPointer);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      wrapper.removeEventListener('mousemove', updateFromClientPosition);
      wrapper.removeEventListener('mousedown', requestLock);
      document.removeEventListener('mousemove', updateLockedPointer);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (document.pointerLockElement === wrapper) {
        document.exitPointerLock?.();
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`game-canvas-wrapper ${pointerLocked ? 'game-canvas-locked' : ''} ${className}`.trim()}
      id="game-canvas"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 500 }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#040916']} />
        <fog attach="fog" args={['#020611', 18, 220]} />
        
        {/* Balanced Lighting */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[0, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 0, 10]} intensity={2.0} color="#ffffff" distance={100} decay={2} />

        <SceneReady onReady={onReady} />
        <MouseControls shipTargetRef={shipTarget} aimRef={aimPos} pointerRef={pointerRef} />
        <SpaceTunnel />
        <Ship targetRef={shipTarget} positionRef={shipPos} />
        <Crosshair3D posRef={aimPos} />
        <GameLogic shipPos={shipPos} aimPos={aimPos} />
      </Canvas>
      <HUD />
    </div>
  );
};

export default GameCanvas;

GAME_MODEL_PATHS.forEach((path) => {
  useGLTF.preload(path);
});

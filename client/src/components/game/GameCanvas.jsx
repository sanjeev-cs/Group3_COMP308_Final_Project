import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Clone, useAnimations, Center } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore.js';
import HUD from './HUD.jsx';
import './GameCanvas.css';

// ─── TUNNEL SETTINGS ────────────────────────────────
const TUNNEL_RADIUS = 12;
const TUNNEL_LENGTH = 300;
const SHIP_Z = 5;
const SPAWN_Z = -200;
const MISS_Z = 15;
const SMOOTH = 0.12;
const MOVEMENT_BOUND = TUNNEL_RADIUS - 1.5;

// ─── THE SPACE TUNNEL ENVIRONMENT ───────────────────────
const Tunnel = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); 
    c.width = 1024; c.height = 1024;
    const x = c.getContext('2d');
    
    // Deep Space void (pitch black with subtle deep nebula gradient)
    x.fillStyle = '#000005'; 
    x.fillRect(0, 0, 1024, 1024);

    let gradient = x.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, "rgba(30, 20, 60, 0.4)"); 
    gradient.addColorStop(0.5, "rgba(10, 20, 40, 0.4)"); 
    gradient.addColorStop(1, "rgba(30, 20, 60, 0.4)");
    x.fillStyle = gradient;
    x.fillRect(0, 0, 1024, 1024);
    
    // Generate massive starfield streaming at warp speed
    for (let i = 0; i < 1500; i++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 1024;
      // Stars stretch wildly along the Y-axis mimicking hyperspace jump strings
      const length = 20 + Math.random() * 150;
      const thickness = 1 + Math.random() * 3;
      
      const rColor = Math.random();
      if (rColor > 0.9) x.fillStyle = '#60a5fa'; // neon blue stars
      else if (rColor > 0.8) x.fillStyle = '#c084fc'; // purple stars
      else x.fillStyle = '#ffffff'; // white core stars
      
      x.globalAlpha = 0.3 + Math.random() * 0.7;
      x.fillRect(sx, sy, thickness, length);
    }
    
    x.globalAlpha = 1.0;
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 4); // Stretch it huge
    return t;
  }, []);

  const ref = useRef();
  useFrame((_, d) => {
    if (ref.current) ref.current.material.map.offset.y -= d * 3.0;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      {/* Massive visual radius so it doesn't feel like a tight pipe, but an open expanse! */}
      <cylinderGeometry args={[40, 40, 200, 32, 1, true]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} />
    </mesh>
  );
};

// ─── PLAYER SHIP ──────────────────────────────────
const Ship = ({ posRef }) => {
  const group = useRef();
  // We use useGLTF without caching locally for simplicity. It handles its own caching.
  const { scene } = useGLTF('/models/spaceship.glb');
  const clone = useMemo(() => scene.clone(true), [scene]);
  const vel = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!group.current) return;
    const g = group.current;
    
    vel.current.x += (posRef.current.x - g.position.x) * SMOOTH;
    vel.current.y += (posRef.current.y - g.position.y) * SMOOTH;
    vel.current.x *= 0.82;
    vel.current.y *= 0.82;
    
    g.position.x += vel.current.x;
    g.position.y += vel.current.y;
    g.position.z = SHIP_Z;

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
  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(posRef.current.x, posRef.current.y, -40);
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
const TYPES = {
  meteor:    { color: '#78716c', scale: 1.8 },
  mine:      { color: '#f59e0b', scale: 0.8 },
  ghost_boy: { color: '#ef4444', scale: 1.0 }, 
  king_boo:  { color: '#34d399', scale: 0.005 },
  boss:      { color: '#ef4444', scale: 0.3 },
  chuck:     { color: '#fcd34d', scale: 1.5 },
};

const BulletModel = () => {
  const gltf = useGLTF('/models/fireball.glb');
  const clone = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
      }
    });
    return c;
  }, [gltf.scene]);
  return <primitive object={clone} scale={0.2} rotation={[Math.PI / 2, 0, 0]} />;
};

const Bullet = ({ id, x, y, z, onDone, registerTarget }) => {
  const ref = useRef();
  
  useEffect(() => {
    registerTarget(id, ref.current);
    return () => registerTarget(id, null);
  }, [id, registerTarget]);

  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.position.z -= BULLET_SPEED * d;
    if (ref.current.position.z < SPAWN_Z) onDone(id);
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      <BulletModel />
      <pointLight color="#f59e0b" intensity={6} distance={6} />
    </group>
  );
};

// ─── DYNAMIC MODEL LOADERS ───────────────────────
const AsteroidModel = ({ scale }) => { const { scene } = useGLTF('/models/meteor.glb'); return <Center><Clone object={scene} scale={scale} /></Center>; };
const DroneModel = ({ scale }) => { 
  const { scene, animations } = useGLTF('/models/aliens/ghost_boy.glb'); 
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
  const { scene, animations } = useGLTF('/models/aliens/king_boo.glb'); 
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

const BossModel = ({ scale }) => { 
  const { scene, animations } = useGLTF('/models/Boss.glb'); 
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

const FunnyModel    = ({ scale }) => { const { scene } = useGLTF('/models/angrybird_chuck.glb'); return <Center><Clone object={scene} scale={scale} /></Center>; };

const Enemy = ({ id, type, px, py, pz, speed, onMiss, registerTarget }) => {
  const ref = useRef();
  const cfg = TYPES[type] || TYPES.asteroid;
  const alive = useRef(true);

  useEffect(() => {
    registerTarget(id, ref.current);
    return () => registerTarget(id, null);
  }, [id, registerTarget]);

  const ModelNode = useMemo(() => {
    switch (type) {
      case 'ghost_boy': return <DroneModel scale={cfg.scale} />;
      case 'mine':      return <MineModel scale={cfg.scale} />;
      case 'king_boo':  return <AlienModel scale={cfg.scale} />;
      case 'boss':      return <BossModel scale={cfg.scale} />;
      case 'chuck':     return <FunnyModel scale={cfg.scale} />;
      default:          return <AsteroidModel scale={cfg.scale} />;
    }
  }, [type, cfg.scale]);

  useFrame((state, d) => {
    if (!ref.current || !alive.current) return;
    ref.current.position.z += speed * d * 8;
    
    ref.current.position.x += Math.sin(state.clock.elapsedTime * 2 + id) * d * 2;
    ref.current.position.y += Math.cos(state.clock.elapsedTime * 1.5 + id) * d * 2;

    const dist = Math.sqrt(ref.current.position.x**2 + ref.current.position.y**2);
    if (dist > MOVEMENT_BOUND) {
      ref.current.position.x *= (MOVEMENT_BOUND/dist);
      ref.current.position.y *= (MOVEMENT_BOUND/dist);
    }

    if (type === 'meteor' || type === 'mine') {
      ref.current.rotation.x += d * 2;
      ref.current.rotation.y += d;
    }

    if (ref.current.position.z > MISS_Z) {
      alive.current = false;
      onMiss(id, type);
    }
  });

  return (
    <group ref={ref} position={[px,py,pz]}>
      {ModelNode}
      <pointLight color={cfg.color} intensity={type==='boss'?2.5:0} distance={6} />
    </group>
  );
};

const Boom = ({ x, y, z, color }) => {
  const ref = useRef();
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

const GameLogic = ({ shipPos }) => {
  const status = useGameStore(s=>s.status);
  const cfg    = useGameStore(s=>s.missionConfig);
  const spawn  = useGameStore(s=>s.spawnObject);
  const hit    = useGameStore(s=>s.hitObject);
  const miss   = useGameStore(s=>s.missObject);
  const tick   = useGameStore(s=>s.tick);
  const adv    = useGameStore(s=>s.advanceWave);
  const objs   = useGameStore(s=>s.gameObjects);

  const [bullets, setBullets] = useState([]);
  const [booms, setBooms]     = useState([]);
  const firing = useRef(false);
  const stRef  = useRef(0);
  const cdRef  = useRef(0);

  const activeBullets = useRef({});
  const activeEnemies = useRef({});

  const regBullet = useCallback((id, mesh) => {
    if (mesh) activeBullets.current[id] = mesh;
    else delete activeBullets.current[id];
  }, []);

  const regEnemy = useCallback((id, mesh) => {
    if (mesh) activeEnemies.current[id] = mesh;
    else delete activeEnemies.current[id];
  }, []);

  useEffect(() => {
    const md = () => { firing.current = true; };
    const mu = () => { firing.current = false; };
    window.addEventListener('mousedown', md);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousedown',md); window.removeEventListener('mouseup',mu); };
  }, []);

  const triggerBoom = useCallback((x,y,z, col) => {
    const id = Date.now()+Math.random();
    setBooms(p => [...p, { id, x,y,z, color: col }]);
    setTimeout(() => setBooms(p => p.filter(e => e.id !== id)), 800);
  }, []);

  const rmBul = useCallback(id => {
    setBullets(p => p.filter(b=>b.id!==id));
    delete activeBullets.current[id];
  }, []);

  useFrame((_, d) => {
    if (status !== 'playing' || !cfg) return;
    tick(d);

    cdRef.current -= d;
    if (firing.current && cdRef.current <= 0) {
      cdRef.current = 0.15;
      setBullets(p => [...p, { id: Date.now()+Math.random(), x: shipPos.current.x, y: shipPos.current.y, z: SHIP_Z }]);
    }

    for (const eId in activeEnemies.current) {
      const eMesh = activeEnemies.current[eId];
      if (!eMesh) continue;
      
      const ePos = eMesh.position;
      let hitBulletId = null;

      for (const bId in activeBullets.current) {
        const bMesh = activeBullets.current[bId];
        if (!bMesh) continue;
        const distSq = ePos.distanceToSquared(bMesh.position);
        if (distSq < 4) {
          hitBulletId = bId;
          break;
        }
      }

      if (hitBulletId) {
        const typeObj = objs.find(o => o.id == eId);
        if (typeObj) {
            triggerBoom(ePos.x, ePos.y, ePos.z, TYPES[typeObj.type]?.color || '#ffffff');
            hit(Number(eId), typeObj.type);
        }
        rmBul(Number(hitBulletId));
        delete activeEnemies.current[eId];
        continue;
      }

      const distToShipSq = ePos.distanceToSquared(shipPos.current);
      if (distToShipSq < 4.0) {
         triggerBoom(ePos.x, ePos.y, ePos.z, '#ef4444');
         hit(Number(eId), 'mine');
         delete activeEnemies.current[eId];
      }
    }

    stRef.current += d;
    if (stRef.current > 1.0 && objs.length < 3) {
      stRef.current = 0;
      const P = cfg.pool || ['asteroid', 'mine'];
      const type = P[Math.floor(Math.random()*P.length)];
      const r = Math.random() * MOVEMENT_BOUND;
      const th = Math.random() * Math.PI * 2;
      
      let speedMult = 2;
      if (type === 'chuck') speedMult = 6.5;
      if (type === 'boss') speedMult = 1.0;
      
      spawn(type, [r * Math.cos(th), r * Math.sin(th), SPAWN_Z], speedMult + Math.random()*(cfg.speed || 1));
      adv();
    }
  });

  return (
    <>
      {objs.map(o => (
        <Enemy key={o.id} id={o.id} type={o.type} px={o.position[0]} py={o.position[1]} pz={o.position[2]} speed={o.speed} 
               onMiss={miss} registerTarget={regEnemy} />
      ))}
      {bullets.map(b => <Bullet key={b.id} id={b.id} x={b.x} y={b.y} z={b.z} onDone={rmBul} registerTarget={regBullet} />)}
      {booms.map(b => <Boom key={b.id} x={b.x} y={b.y} z={b.z} color={b.color} />)}
    </>
  );
};

// ─── MOUSE LISTENER ───────────────────────────────
const MouseControls = ({ posRef }) => {
  useFrame(({ mouse }) => {
    const targetX = mouse.x * MOVEMENT_BOUND;
    const targetY = mouse.y * MOVEMENT_BOUND;

    if (posRef.current) {
      posRef.current.x += (targetX - posRef.current.x) * 0.1;
      posRef.current.y += (targetY - posRef.current.y) * 0.1;
    }
  });
  return null;
};

// ══════════════════════════════════════════════════
const GameCanvas = () => {
  const shipPos = useRef(new THREE.Vector3(0, 0, SHIP_Z));

  return (
    <div className="game-canvas-wrapper" id="game-canvas">
      <Canvas camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 500 }}>
        <color attach="background" args={['#000000']} />
        
        {/* Balanced Lighting */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[0, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 0, 10]} intensity={2.0} color="#ffffff" distance={100} decay={2} />

        <MouseControls posRef={shipPos} />
        <Tunnel />
        <Ship posRef={shipPos} />
        <Crosshair3D posRef={shipPos} />
        <GameLogic shipPos={shipPos} />
      </Canvas>
      <HUD />
    </div>
  );
};

export default GameCanvas;

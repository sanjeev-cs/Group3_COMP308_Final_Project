import { create } from 'zustand';

/**
 * Zustand store for high-frequency game state.
 * Kept outside React render cycle for performance.
 */
const useGameStore = create((set, get) => ({
  // Game status
  status: 'idle', // idle | briefing | playing | paused | completed | failed
  missionId: null,
  missionConfig: null,

  // In-game state
  score: 0,
  lives: 3,
  combo: 0,
  maxCombo: 0,
  timeRemaining: 60,
  wavesCompleted: 0,
  objectsDestroyed: 0,
  currentWave: 0,

  // Active power-ups for this mission
  activePowerUps: [],

  // Objects currently alive in the scene
  gameObjects: [],
  nextObjectId: 1,

  // ─── Actions ──────────────────────────────────────────

  startMission: (missionId, config) => set({
    status: 'playing',
    missionId,
    missionConfig: config,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    timeRemaining: config.duration,
    wavesCompleted: 0,
    objectsDestroyed: 0,
    currentWave: 0,
    gameObjects: [],
    nextObjectId: 1,
  }),

  setStatus: (status) => set({ status }),

  // Spawn a new game object
  spawnObject: (type, position, speed) => {
    const state = get();
    const id = state.nextObjectId;
    const obj = { id, type, position, speed, alive: true, spawnedAt: Date.now() };
    set({
      gameObjects: [...state.gameObjects, obj],
      nextObjectId: id + 1,
    });
    return id;
  },

  // Remove an object (clicked or missed)
  removeObject: (id) => set((state) => ({
    gameObjects: state.gameObjects.filter((o) => o.id !== id),
  })),

  // Player clicked a target
  hitObject: (id, type) => {
    const state = get();
    let scoreAdd = 0;
    let livesChange = 0;
    let comboAdd = 0;
    let timeAdd = 0;

    switch (type) {
      case 'asteroid':
        scoreAdd = 10;
        comboAdd = 1;
        break;
      case 'drone':
        scoreAdd = 20;
        comboAdd = 1;
        break;
      case 'alien':
        scoreAdd = 30;
        comboAdd = 1;
        break;
      case 'funny':
        scoreAdd = 50;
        comboAdd = 1;
        break;
      case 'boss':
        scoreAdd = 100;
        comboAdd = 1;
        break;
      case 'energy':
        scoreAdd = 15;
        comboAdd = 1;
        break;
      case 'stardust':
        scoreAdd = 25;
        comboAdd = 1;
        timeAdd = 3;
        break;
      case 'mine':
        scoreAdd = -15;
        livesChange = -1;
        comboAdd = -state.combo; // Reset combo
        break;
      default:
        scoreAdd = 10;
        comboAdd = 1;
        break;
    }

    const newCombo = Math.max(0, state.combo + comboAdd);
    const comboMultiplier = 1 + Math.floor(newCombo / 5) * 0.5; // +0.5x every 5 hits
    const finalScore = Math.max(0, state.score + Math.floor(scoreAdd * comboMultiplier));
    const newLives = state.lives + livesChange;

    set({
      score: finalScore,
      lives: newLives,
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      objectsDestroyed: state.objectsDestroyed + (type !== 'mine' ? 1 : 0),
      timeRemaining: state.timeRemaining + timeAdd,
      gameObjects: state.gameObjects.filter((o) => o.id !== id),
    });

    // Check for game over
    if (newLives <= 0) {
      set({ status: 'failed' });
    }
  },

  // Object reached the station (missed)
  missObject: (id, type) => {
    const state = get();
    if (['asteroid', 'drone', 'alien', 'boss', 'funny'].includes(type)) {
      const newLives = state.lives - 1;
      set({
        lives: newLives,
        combo: 0, // Reset combo on miss
        gameObjects: state.gameObjects.filter((o) => o.id !== id),
      });
      if (newLives <= 0) {
        set({ status: 'failed' });
      }
    } else {
      // Energy/stardust/mine just disappear — no penalty for missing collectibles
      set({
        gameObjects: state.gameObjects.filter((o) => o.id !== id),
      });
    }
  },

  // Timer tick
  tick: (delta) => {
    const state = get();
    if (state.status !== 'playing') return;
    const newTime = state.timeRemaining - delta;
    if (newTime <= 0) {
      set({ timeRemaining: 0, status: 'completed' });
    } else {
      set({ timeRemaining: newTime });
    }
  },

  advanceWave: () => set((state) => ({
    wavesCompleted: state.wavesCompleted + 1,
    currentWave: state.currentWave + 1,
  })),

  setActivePowerUps: (powerUps) => set({ activePowerUps: powerUps }),

  reset: () => set({
    status: 'idle',
    missionId: null,
    missionConfig: null,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    timeRemaining: 60,
    wavesCompleted: 0,
    objectsDestroyed: 0,
    currentWave: 0,
    activePowerUps: [],
    gameObjects: [],
    nextObjectId: 1,
  }),
}));

export default useGameStore;

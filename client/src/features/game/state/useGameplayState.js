import { create } from 'zustand';

const OBJECT_HEALTH = {
  meteor: 1,
  mine: 1,
  ghost_boy: 1,
  king_boo: 1,
  chuck: 1,
  boss: 3,
  energy: 1,
  stardust: 1,
};

/**
 * Zustand state container for high-frequency gameplay state.
 * Kept outside the React render cycle for performance.
 */
const useGameplayState = create((set, get) => ({
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

  // Actions
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

  spawnObject: (type, position, speed) => {
    const state = get();
    const id = state.nextObjectId;
    const health = OBJECT_HEALTH[type] ?? 1;
    const obj = { id, type, position, speed, health, maxHealth: health, alive: true, spawnedAt: Date.now() };

    set({
      gameObjects: [...state.gameObjects, obj],
      nextObjectId: id + 1,
    });

    return id;
  },

  removeObject: (id) => set((state) => ({
    gameObjects: state.gameObjects.filter((object) => object.id !== id),
  })),

  hitObject: (id, type) => {
    const state = get();
    const target = state.gameObjects.find((object) => object.id === id);
    const targetType = target?.type || type;
    const currentHealth = target?.health ?? (OBJECT_HEALTH[targetType] ?? 1);

    if (currentHealth > 1) {
      set({
        gameObjects: state.gameObjects.map((object) => (
          object.id === id
            ? { ...object, health: object.health - 1 }
            : object
        )),
      });

      return { destroyed: false, remainingHealth: currentHealth - 1 };
    }

    let scoreAdd = 0;
    let livesChange = 0;
    let comboAdd = 0;
    let timeAdd = 0;

    switch (targetType) {
      case 'meteor':
        scoreAdd = 10;
        comboAdd = 1;
        break;
      case 'ghost_boy':
        scoreAdd = 20;
        comboAdd = 1;
        break;
      case 'king_boo':
        scoreAdd = 30;
        comboAdd = 1;
        break;
      case 'chuck':
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
        comboAdd = -state.combo;
        break;
      default:
        scoreAdd = 10;
        comboAdd = 1;
        break;
    }

    const newCombo = Math.max(0, state.combo + comboAdd);
    const comboMultiplier = 1 + Math.floor(newCombo / 5) * 0.5;
    const finalScore = Math.max(0, state.score + Math.floor(scoreAdd * comboMultiplier));
    const newLives = state.lives + livesChange;

    set({
      score: finalScore,
      lives: newLives,
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      objectsDestroyed: state.objectsDestroyed + (targetType !== 'mine' ? 1 : 0),
      timeRemaining: state.timeRemaining + timeAdd,
      gameObjects: state.gameObjects.filter((object) => object.id !== id),
    });

    if (newLives <= 0) {
      set({ status: 'failed' });
    }

    return { destroyed: true, remainingHealth: 0 };
  },

  missObject: (id, type) => {
    const state = get();

    if (['meteor', 'ghost_boy', 'king_boo', 'boss', 'chuck'].includes(type)) {
      const newLives = state.lives - 1;

      set({
        lives: newLives,
        combo: 0,
        gameObjects: state.gameObjects.filter((object) => object.id !== id),
      });

      if (newLives <= 0) {
        set({ status: 'failed' });
      }
    } else {
      set({
        gameObjects: state.gameObjects.filter((object) => object.id !== id),
      });
    }
  },

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

export default useGameplayState;

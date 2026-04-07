export const MISSION_META = {
  1: {
    id: 1,
    name: 'The Minefield',
    difficulty: 'Easy',
    marker: '01',
    previewDesc: 'Learn the tunnel against meteors and mines.',
    selectDesc: 'Classic survival. Learn to dodge meteors and mines.',
  },
  2: {
    id: 2,
    name: 'Specter Run',
    difficulty: 'Medium',
    marker: '02',
    previewDesc: 'Faster waves with ghost targets and tighter gaps.',
    selectDesc: 'Faster waves with ghost targets, tight gaps, and live mines.',
  },
  3: {
    id: 3,
    name: 'The Absurd Threat',
    difficulty: 'Hard',
    marker: '03',
    previewDesc: 'Maximum speed, boss pressure, almost no recovery.',
    selectDesc: 'Maximum speed. Survive Chuck, the Boss, and the minefield.',
  },
};

export const MISSION_ORDER = [1, 2, 3];

export const getMissionMeta = (missionId) => MISSION_META[missionId] || null;

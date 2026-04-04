/**
 * Game logic utilities — XP calculations, level thresholds, star ratings.
 */

// XP required to reach each level (exponential curve)
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  850,   // Level 5
  1300,  // Level 6
  1900,  // Level 7
  2700,  // Level 8
  3800,  // Level 9
  5200,  // Level 10
];

// Mission definitions used by both server and seed
export const MISSIONS = [
  {
    id: 1,
    name: 'Asteroid Belt',
    description: 'Navigate through a dense asteroid field. Destroy incoming rocks before they hit your station.',
    difficulty: 'Easy',
    duration: 60,
    waves: 8,
    objectsPerWave: { min: 3, max: 4 },
    speed: 1,
    requiredLevel: 1,
    baseXP: 30,
    baseStardust: 20,
  },
  {
    id: 2,
    name: 'Drone Swarm',
    description: 'An alien drone swarm approaches! They move faster and zigzag unpredictably.',
    difficulty: 'Medium',
    duration: 50,
    waves: 12,
    objectsPerWave: { min: 4, max: 6 },
    speed: 1.5,
    requiredLevel: 3,
    baseXP: 60,
    baseStardust: 40,
  },
  {
    id: 3,
    name: 'Meteor Storm',
    description: 'A massive meteor storm threatens the station. Only the quickest commanders will survive.',
    difficulty: 'Hard',
    duration: 45,
    waves: 15,
    objectsPerWave: { min: 5, max: 8 },
    speed: 2,
    requiredLevel: 5,
    baseXP: 100,
    baseStardust: 70,
  },
];

/**
 * Calculate XP gained from a completed mission.
 */
export const calculateXPGain = (missionId, score, maxCombo) => {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return 0;

  const baseXP = mission.baseXP;
  const scoreBonus = Math.floor(score / 50);
  const comboBonus = maxCombo * 2;

  return baseXP + scoreBonus + comboBonus;
};

/**
 * Calculate stardust earned from a completed mission.
 */
export const calculateStardustGain = (missionId, score) => {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return 0;

  return mission.baseStardust + Math.floor(score / 100) * 5;
};

/**
 * Calculate star rating (1-3) based on score thresholds.
 */
export const calculateStars = (missionId, score) => {
  const thresholds = {
    1: [50, 120, 200],
    2: [100, 200, 350],
    3: [150, 300, 500],
  };
  const t = thresholds[missionId] || [50, 100, 200];

  if (score >= t[2]) return 3;
  if (score >= t[1]) return 2;
  if (score >= t[0]) return 1;
  return 0;
};

/**
 * Check if a user should level up based on total XP.
 * Returns the new level.
 */
export const calculateLevel = (totalXP) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 10);
};

/**
 * Get XP required for current level and next level.
 */
export const getLevelProgress = (level, totalXP) => {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  return {
    currentLevelXP: totalXP - currentThreshold,
    xpForNextLevel: nextThreshold - currentThreshold,
    totalXP,
    level,
  };
};

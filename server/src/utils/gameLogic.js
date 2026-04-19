import { MISSION_CATALOG } from '../../../shared/gameContent.js';

/**
 * Game logic utilities - XP calculations, level thresholds, star ratings.
 */

const LEVEL_THRESHOLDS = [
  0,
  100,
  250,
  500,
  850,
  1300,
  1900,
  2700,
  3800,
  5200,
];

export const MISSIONS = MISSION_CATALOG.map((mission) => ({
  id: mission.id,
  name: mission.name,
  description: mission.description,
  difficulty: mission.difficulty,
  duration: mission.duration,
  waves: mission.waves,
  speed: mission.speed,
  requiredLevel: mission.requiredLevel,
  baseXP: mission.baseXP,
  baseStardust: mission.baseStardust,
}));

export const calculateXPGain = (missionId, score, maxCombo) => {
  const mission = MISSIONS.find((entry) => entry.id === missionId);
  if (!mission) return 0;

  const scoreBonus = Math.floor(score / 50);
  const comboBonus = maxCombo * 2;

  return mission.baseXP + scoreBonus + comboBonus;
};

export const calculateStardustGain = (missionId, score) => {
  const mission = MISSIONS.find((entry) => entry.id === missionId);
  if (!mission) return 0;

  return mission.baseStardust + Math.floor(score / 100) * 5;
};

export const calculateStars = (missionId, score) => {
  const thresholds = {
    1: [50, 120, 200],
    2: [100, 200, 350],
    3: [150, 300, 500],
  };
  const missionThresholds = thresholds[missionId] || [50, 100, 200];

  if (score >= missionThresholds[2]) return 3;
  if (score >= missionThresholds[1]) return 2;
  if (score >= missionThresholds[0]) return 1;
  return 0;
};

export const calculateLevel = (totalXP) => {
  let level = 1;

  for (let index = LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (totalXP >= LEVEL_THRESHOLDS[index]) {
      level = index + 1;
      break;
    }
  }

  return Math.min(level, 10);
};

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

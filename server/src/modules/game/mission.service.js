import { MISSIONS, getLevelProgress } from './gameLogic.js';
import GameProgress from './gameProgress.model.js';

export const listMissions = () => MISSIONS;

export const assertMissionExists = (missionId) => {
  const mission = MISSIONS.find((entry) => entry.id === missionId);

  if (!mission) {
    throw new Error('Invalid mission ID');
  }

  return mission;
};

export const getUserProgress = async (userId) => GameProgress.find({ userId }).sort({ missionId: 1 });

export const getUserMissionProgress = async (userId, missionId) => GameProgress.findOne({ userId, missionId });

export const getUserLevelProgress = (user) => getLevelProgress(user.level, user.xp);

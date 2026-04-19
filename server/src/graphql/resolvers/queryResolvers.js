import { listAchievements, listUserAchievements } from '../../modules/achievements/achievement.service.js';
import { listActiveChallenges } from '../../modules/challenges/challenge.service.js';
import { getLeaderboard } from '../../modules/game/leaderboard.service.js';
import {
  getUserLevelProgress,
  getUserMissionProgress,
  getUserProgress,
  listMissions,
} from '../../modules/game/mission.service.js';
import { requireAuth } from '../../security/authContext.js';

const queryResolvers = {
  me: async (_, __, context) => context.user || null,

  getMissions: async () => listMissions(),

  getMyProgress: async (_, __, context) => {
    const user = requireAuth(context);
    return getUserProgress(user.id);
  },

  getMissionProgress: async (_, { missionId }, context) => {
    const user = requireAuth(context);
    return getUserMissionProgress(user.id, missionId);
  },

  getLeaderboard: async (_, { limit = 20 }) => getLeaderboard({ limit }),

  getAchievements: async () => listAchievements(),

  getMyAchievements: async (_, __, context) => {
    const user = requireAuth(context);
    return listUserAchievements(user);
  },

  getActiveChallenges: async () => listActiveChallenges(),

  getLevelProgress: async (_, __, context) => {
    const user = requireAuth(context);
    return getUserLevelProgress(user);
  },
};

export default queryResolvers;

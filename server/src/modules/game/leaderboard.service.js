import { DEFAULT_AVATAR } from '../users/user.service.js';
import User from '../users/user.model.js';

export const getLeaderboard = async ({ limit = 20 } = {}) => {
  const users = await User.find({})
    .sort({ 'stats.totalScore': -1, level: -1, createdAt: 1 })
    .limit(limit)
    .select('username avatar stats.totalScore createdAt')
    .lean();

  return users.map((user) => ({
    id: user._id.toString(),
    userId: user._id.toString(),
    username: user.username || 'Unknown',
    avatar: user.avatar || DEFAULT_AVATAR,
    missionId: 0,
    score: user.stats?.totalScore || 0,
    completedAt: user.createdAt?.toISOString() || new Date().toISOString(),
  }));
};

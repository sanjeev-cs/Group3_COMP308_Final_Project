import { applyRewardsToUser, findUserByIdOrThrow } from '../users/user.service.js';
import Achievement from './achievement.model.js';
import { ACHIEVEMENT_PRESETS, DEFAULT_ACHIEVEMENTS } from './achievementPresets.js';

const mergePresetData = (achievement) => ({
  ...achievement,
  ...(ACHIEVEMENT_PRESETS[achievement.key] || {}),
});

export const listAchievements = async () => {
  const achievements = await Achievement.find({}).lean();

  if (!achievements.length) {
    return DEFAULT_ACHIEVEMENTS;
  }

  return achievements.map(mergePresetData);
};

export const listUserAchievements = async (user) => {
  if (!user.achievements.length) {
    return [];
  }

  const achievements = await Achievement.find({ key: { $in: user.achievements } }).lean();

  if (!achievements.length) {
    return user.achievements
      .filter((key) => ACHIEVEMENT_PRESETS[key])
      .map((key, index) => ({
        id: `preset-user-${index + 1}`,
        key,
        ...ACHIEVEMENT_PRESETS[key],
      }));
  }

  return achievements.map(mergePresetData);
};

export const claimAchievement = async ({ userId, key }) => {
  const achievement = await Achievement.findOne({ key });
  const achievementPreset = ACHIEVEMENT_PRESETS[key];

  if (!achievement && !achievementPreset) {
    throw new Error('Achievement not found');
  }

  const user = await findUserByIdOrThrow(userId);

  if (user.achievements.includes(key)) {
    throw new Error('Achievement already claimed');
  }

  user.achievements.push(key);
  applyRewardsToUser(user, {
    xp: achievement?.xpReward ?? achievementPreset.xpReward,
    stardust: achievement?.stardustReward ?? achievementPreset.stardustReward,
  });

  await user.save();
  return user;
};

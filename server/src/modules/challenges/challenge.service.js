import { applyRewardsToUser, findUserByIdOrThrow } from '../users/user.service.js';
import Challenge from './challenge.model.js';
import { ACTIVE_CHALLENGE_PRESET_MAP, ACTIVE_CHALLENGE_PRESETS } from './challengePresets.js';

const mergePresetData = (challenge) => {
  const preset = ACTIVE_CHALLENGE_PRESET_MAP[challenge.title];

  if (!preset) {
    return challenge;
  }

  return {
    ...challenge,
    description: preset.description,
    condition: preset.condition,
    type: preset.type,
  };
};

export const listActiveChallenges = async () => {
  const challenges = await Challenge.find({ isActive: true }).lean();

  if (!challenges.length) {
    return ACTIVE_CHALLENGE_PRESETS.map((challenge, index) => ({
      id: `preset-${index + 1}`,
      ...challenge,
    }));
  }

  return challenges.map(mergePresetData);
};

export const completeChallenge = async ({ userId, challengeId }) => {
  const challenge = await Challenge.findById(challengeId);

  if (!challenge || !challenge.isActive) {
    throw new Error('Challenge not found or inactive');
  }

  const user = await findUserByIdOrThrow(userId);
  applyRewardsToUser(user, {
    xp: challenge.xpReward,
    stardust: challenge.stardustReward,
  });

  await user.save();
  return user;
};

import { applyRewardsToUser, findUserByIdOrThrow } from '../users/user.service.js';
import {
  calculateStars,
  calculateStardustGain,
  calculateXPGain,
} from './gameLogic.js';
import GameProgress from './gameProgress.model.js';
import LeaderboardEntry from './leaderboardEntry.model.js';
import { assertMissionExists } from './mission.service.js';

const updateExistingProgress = (progress, input, starsEarned) => {
  progress.attempts += 1;

  if (input.score > progress.score) {
    progress.score = input.score;
    progress.wavesCompleted = input.wavesCompleted;
    progress.objectsDestroyed = input.objectsDestroyed;
    progress.livesRemaining = input.livesRemaining;
    progress.maxCombo = input.maxCombo;
    progress.starsEarned = Math.max(progress.starsEarned, starsEarned);
  }

  if (input.completed && !progress.completed) {
    progress.completed = true;
    progress.completedAt = new Date();
  }
};

const createProgressRecord = async (userId, input, starsEarned) => GameProgress.create({
  userId,
  missionId: input.missionId,
  score: input.score,
  wavesCompleted: input.wavesCompleted,
  objectsDestroyed: input.objectsDestroyed,
  livesRemaining: input.livesRemaining,
  maxCombo: input.maxCombo,
  starsEarned,
  completed: input.completed,
  completedAt: input.completed ? new Date() : undefined,
});

export const saveGameResult = async ({ userId, input }) => {
  assertMissionExists(input.missionId);

  const starsEarned = calculateStars(input.missionId, input.score);
  const xpGain = input.completed
    ? calculateXPGain(input.missionId, input.score, input.maxCombo)
    : Math.floor(calculateXPGain(input.missionId, input.score, input.maxCombo) * 0.3);
  const stardustGain = input.completed
    ? calculateStardustGain(input.missionId, input.score)
    : Math.floor(calculateStardustGain(input.missionId, input.score) * 0.2);

  let progress = await GameProgress.findOne({ userId, missionId: input.missionId });

  if (progress) {
    updateExistingProgress(progress, input, starsEarned);
    await progress.save();
  } else {
    progress = await createProgressRecord(userId, input, starsEarned);
  }

  const user = await findUserByIdOrThrow(userId);
  applyRewardsToUser(user, { xp: xpGain, stardust: stardustGain });
  user.stats.gamesPlayed += 1;
  user.stats.totalScore += input.score;
  user.stats.totalAsteroidsDestroyed += input.objectsDestroyed;
  user.stats.highestCombo = Math.max(user.stats.highestCombo, input.maxCombo);
  await user.save();

  let scoreSubmittedEvent = null;

  if (input.completed) {
    const leaderboardEntry = await LeaderboardEntry.create({
      userId,
      missionId: input.missionId,
      score: input.score,
      completedAt: new Date(),
    });

    scoreSubmittedEvent = {
      id: leaderboardEntry._id.toString(),
      userId: userId.toString(),
      username: user.username,
      avatar: user.avatar,
      missionId: input.missionId,
      score: input.score,
      completedAt: new Date().toISOString(),
    };
  }

  return { progress, scoreSubmittedEvent };
};

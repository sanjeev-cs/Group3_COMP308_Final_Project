import { PubSub } from 'graphql-subscriptions';
import User from '../models/User.js';
import GameProgress from '../models/GameProgress.js';
import Achievement from '../models/Achievement.js';
import LeaderboardEntry from '../models/LeaderboardEntry.js';
import Challenge from '../models/Challenge.js';
import { generateToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import {
  MISSIONS,
  calculateXPGain,
  calculateStardustGain,
  calculateStars,
  calculateLevel,
  getLevelProgress,
} from '../utils/gameLogic.js';

const pubsub = new PubSub();
const SCORE_SUBMITTED = 'SCORE_SUBMITTED';

// Power-up definitions (kept in code, not DB, for simplicity)
const POWER_UPS = {
  auto_turret: { name: 'Auto-Turret', cost: 100 },
  time_warp: { name: 'Time Warp', cost: 150 },
  force_shield: { name: 'Force Shield', cost: 200 },
};

const resolvers = {
  // ─── Queries ──────────────────────────────────────────

  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;
      return context.user;
    },

    getMissions: () => {
      return MISSIONS;
    },

    getMyProgress: async (_, __, context) => {
      const user = requireAuth(context);
      return GameProgress.find({ userId: user.id }).sort({ missionId: 1 });
    },

    getMissionProgress: async (_, { missionId }, context) => {
      const user = requireAuth(context);
      return GameProgress.findOne({ userId: user.id, missionId });
    },

    getLeaderboard: async (_, { missionId, limit = 20 }) => {
      const query = missionId ? { missionId } : {};
      const entries = await LeaderboardEntry.find(query)
        .sort({ score: -1 })
        .limit(limit)
        .lean();

      // Populate user info
      const userIds = [...new Set(entries.map((e) => e.userId.toString()))];
      const users = await User.find({ _id: { $in: userIds } }).select('username avatar').lean();
      const userMap = {};
      users.forEach((u) => { userMap[u._id.toString()] = u; });

      return entries.map((entry) => {
        const user = userMap[entry.userId.toString()] || {};
        return {
          id: entry._id.toString(),
          userId: entry.userId.toString(),
          username: user.username || 'Unknown',
          avatar: user.avatar || '🚀',
          missionId: entry.missionId,
          score: entry.score,
          completedAt: entry.completedAt?.toISOString() || entry.createdAt?.toISOString(),
        };
      });
    },

    getAchievements: async () => {
      return Achievement.find({});
    },

    getMyAchievements: async (_, __, context) => {
      const user = requireAuth(context);
      if (!user.achievements.length) return [];
      return Achievement.find({ key: { $in: user.achievements } });
    },

    getActiveChallenges: async () => {
      return Challenge.find({ isActive: true });
    },

    getLevelProgress: async (_, __, context) => {
      const user = requireAuth(context);
      return getLevelProgress(user.level, user.xp);
    },
  },

  // ─── Mutations ────────────────────────────────────────

  Mutation: {
    register: async (_, { input }) => {
      const { username, email, password, avatar } = input;

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new Error(
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken'
        );
      }

      const user = new User({
        username,
        email,
        passwordHash: password, // Pre-save hook will hash this
        avatar: avatar || '🚀',
      });

      await user.save();
      const token = generateToken(user);

      // Return user without passwordHash
      const userObj = user.toObject();
      delete userObj.passwordHash;

      return { token, user: { ...userObj, id: user._id.toString() } };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid email or password');

      const isValid = await user.comparePassword(password);
      if (!isValid) throw new Error('Invalid email or password');

      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.passwordHash;

      return { token, user: { ...userObj, id: user._id.toString() } };
    },

    saveGameResult: async (_, { input }, context) => {
      const user = requireAuth(context);
      const {
        missionId, score, wavesCompleted, objectsDestroyed,
        livesRemaining, maxCombo, completed,
      } = input;

      // Validate mission exists
      const mission = MISSIONS.find((m) => m.id === missionId);
      if (!mission) throw new Error('Invalid mission ID');

      // Calculate rewards
      const starsEarned = calculateStars(missionId, score);
      const xpGain = completed ? calculateXPGain(missionId, score, maxCombo) : Math.floor(calculateXPGain(missionId, score, maxCombo) * 0.3);
      const stardustGain = completed ? calculateStardustGain(missionId, score) : Math.floor(calculateStardustGain(missionId, score) * 0.2);

      // Upsert game progress (keep best score)
      let progress = await GameProgress.findOne({ userId: user.id, missionId });

      if (progress) {
        progress.attempts += 1;
        // Update only if score is better or first completion
        if (score > progress.score) {
          progress.score = score;
          progress.wavesCompleted = wavesCompleted;
          progress.objectsDestroyed = objectsDestroyed;
          progress.livesRemaining = livesRemaining;
          progress.maxCombo = maxCombo;
          progress.starsEarned = Math.max(progress.starsEarned, starsEarned);
        }
        if (completed && !progress.completed) {
          progress.completed = true;
          progress.completedAt = new Date();
        }
        await progress.save();
      } else {
        progress = await GameProgress.create({
          userId: user.id,
          missionId,
          score,
          wavesCompleted,
          objectsDestroyed,
          livesRemaining,
          maxCombo,
          starsEarned,
          completed,
          completedAt: completed ? new Date() : undefined,
        });
      }

      // Update user stats
      const fullUser = await User.findById(user.id);
      fullUser.xp += xpGain;
      fullUser.stardust += stardustGain;
      fullUser.stats.gamesPlayed += 1;
      fullUser.stats.totalScore += score;
      fullUser.stats.totalAsteroidsDestroyed += objectsDestroyed;
      if (maxCombo > fullUser.stats.highestCombo) {
        fullUser.stats.highestCombo = maxCombo;
      }

      // Check for level up
      const newLevel = calculateLevel(fullUser.xp);
      if (newLevel > fullUser.level) {
        fullUser.level = newLevel;
      }

      await fullUser.save();

      // Add leaderboard entry
      if (completed) {
        const leaderboardEntry = await LeaderboardEntry.create({
          userId: user.id,
          missionId,
          score,
          completedAt: new Date(),
        });

        // Publish for subscription
        pubsub.publish(SCORE_SUBMITTED, {
          scoreSubmitted: {
            id: leaderboardEntry._id.toString(),
            userId: user.id.toString(),
            username: fullUser.username,
            avatar: fullUser.avatar,
            missionId,
            score,
            completedAt: new Date().toISOString(),
          },
        });
      }

      return progress;
    },

    purchasePowerUp: async (_, { powerUpId }, context) => {
      const user = requireAuth(context);
      const powerUp = POWER_UPS[powerUpId];
      if (!powerUp) throw new Error('Invalid power-up');

      const fullUser = await User.findById(user.id);
      if (fullUser.unlockedPowerUps.includes(powerUpId)) {
        throw new Error('Power-up already owned');
      }
      if (fullUser.stardust < powerUp.cost) {
        throw new Error(`Not enough Stardust. Need ${powerUp.cost}, have ${fullUser.stardust}`);
      }

      fullUser.stardust -= powerUp.cost;
      fullUser.unlockedPowerUps.push(powerUpId);
      await fullUser.save();

      return fullUser;
    },

    claimAchievement: async (_, { key }, context) => {
      const user = requireAuth(context);

      const achievement = await Achievement.findOne({ key });
      if (!achievement) throw new Error('Achievement not found');

      const fullUser = await User.findById(user.id);
      if (fullUser.achievements.includes(key)) {
        throw new Error('Achievement already claimed');
      }

      fullUser.achievements.push(key);
      fullUser.xp += achievement.xpReward;
      fullUser.stardust += achievement.stardustReward;

      // Recalculate level
      const newLevel = calculateLevel(fullUser.xp);
      if (newLevel > fullUser.level) {
        fullUser.level = newLevel;
      }

      await fullUser.save();
      return fullUser;
    },

    completeChallenge: async (_, { challengeId }, context) => {
      const user = requireAuth(context);

      const challenge = await Challenge.findById(challengeId);
      if (!challenge || !challenge.isActive) throw new Error('Challenge not found or inactive');

      const fullUser = await User.findById(user.id);
      fullUser.xp += challenge.xpReward;
      fullUser.stardust += challenge.stardustReward;

      const newLevel = calculateLevel(fullUser.xp);
      if (newLevel > fullUser.level) {
        fullUser.level = newLevel;
      }

      await fullUser.save();
      return fullUser;
    },
  },

  // ─── Subscriptions ────────────────────────────────────

  Subscription: {
    scoreSubmitted: {
      subscribe: (_, { missionId }) => {
        if (missionId) {
          // Filter by mission — use asyncIterator with filter
          return {
            [Symbol.asyncIterator]: () => {
              const iterator = pubsub.asyncIterator([SCORE_SUBMITTED]);
              return {
                async next() {
                  while (true) {
                    const result = await iterator.next();
                    if (result.done) return result;
                    if (result.value.scoreSubmitted.missionId === missionId) {
                      return result;
                    }
                  }
                },
                return: iterator.return?.bind(iterator),
                throw: iterator.throw?.bind(iterator),
              };
            },
          };
        }
        return pubsub.asyncIterator([SCORE_SUBMITTED]);
      },
    },
  },
};

export default resolvers;

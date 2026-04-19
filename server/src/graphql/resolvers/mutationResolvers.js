import { claimAchievement } from '../../modules/achievements/achievement.service.js';
import { askGameAssistant } from '../../modules/assistant/assistantService.js';
import { completeChallenge } from '../../modules/challenges/challenge.service.js';
import { purchasePowerUp } from '../../modules/game/powerUp.service.js';
import { saveGameResult } from '../../modules/game/progress.service.js';
import { loginUser, registerUser, updateUserProfile } from '../../modules/users/user.service.js';
import { requireAuth } from '../../security/authContext.js';
import { pubsub, SCORE_SUBMITTED } from './pubsub.js';

const mutationResolvers = {
  register: async (_, { input }) => registerUser(input),

  login: async (_, { username, password }) => loginUser({ username, password }),

  updateProfile: async (_, { input }, context) => {
    const user = requireAuth(context);
    return updateUserProfile({ userId: user.id, input });
  },

  saveGameResult: async (_, { input }, context) => {
    const user = requireAuth(context);
    const result = await saveGameResult({ userId: user.id, input });

    if (result.scoreSubmittedEvent) {
      pubsub.publish(SCORE_SUBMITTED, {
        scoreSubmitted: result.scoreSubmittedEvent,
      });
    }

    return result.progress;
  },

  purchasePowerUp: async (_, { powerUpId }, context) => {
    const user = requireAuth(context);
    return purchasePowerUp({ userId: user.id, powerUpId });
  },

  claimAchievement: async (_, { key }, context) => {
    const user = requireAuth(context);
    return claimAchievement({ userId: user.id, key });
  },

  completeChallenge: async (_, { challengeId }, context) => {
    const user = requireAuth(context);
    return completeChallenge({ userId: user.id, challengeId });
  },

  askGameAssistant: async (_, { input }, context) => askGameAssistant({
    input,
    isAuthenticated: Boolean(context.user),
  }),
};

export default mutationResolvers;

import { askGameAssistant } from '../services/gameAssistantService.js';

const assistantMutation = {
  askGameAssistant: async (_, { input }, context) => askGameAssistant({
    input,
    isAuthenticated: Boolean(context.user),
  }),
};

export default assistantMutation;

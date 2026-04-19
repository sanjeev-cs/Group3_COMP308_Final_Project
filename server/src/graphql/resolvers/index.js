import mutationResolvers from './mutationResolvers.js';
import queryResolvers from './queryResolvers.js';
import subscriptionResolvers from './subscriptionResolvers.js';

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
};

export default resolvers;

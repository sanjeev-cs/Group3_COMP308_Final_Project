import { pubsub, SCORE_SUBMITTED } from './pubsub.js';

const subscriptionResolvers = {
  scoreSubmitted: {
    subscribe: (_, { missionId }) => {
      if (missionId) {
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
};

export default subscriptionResolvers;

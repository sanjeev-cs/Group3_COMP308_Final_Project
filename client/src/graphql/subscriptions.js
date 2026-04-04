import { gql } from '@apollo/client';

export const SCORE_SUBMITTED_SUBSCRIPTION = gql`
  subscription ScoreSubmitted($missionId: Int) {
    scoreSubmitted(missionId: $missionId) {
      id
      userId
      username
      avatar
      missionId
      score
      completedAt
    }
  }
`;

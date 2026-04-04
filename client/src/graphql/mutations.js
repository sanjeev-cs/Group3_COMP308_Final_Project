import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        avatar
        level
        xp
        stardust
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        avatar
        level
        xp
        stardust
        unlockedPowerUps
        achievements
        stats {
          gamesPlayed
          totalScore
          highestCombo
          totalAsteroidsDestroyed
        }
      }
    }
  }
`;

export const SAVE_GAME_RESULT = gql`
  mutation SaveGameResult($input: GameResultInput!) {
    saveGameResult(input: $input) {
      id
      missionId
      score
      wavesCompleted
      objectsDestroyed
      livesRemaining
      maxCombo
      starsEarned
      completed
      completedAt
      attempts
    }
  }
`;

export const PURCHASE_POWER_UP = gql`
  mutation PurchasePowerUp($powerUpId: String!) {
    purchasePowerUp(powerUpId: $powerUpId) {
      id
      stardust
      unlockedPowerUps
    }
  }
`;

export const CLAIM_ACHIEVEMENT = gql`
  mutation ClaimAchievement($key: String!) {
    claimAchievement(key: $key) {
      id
      xp
      stardust
      achievements
      level
    }
  }
`;

export const COMPLETE_CHALLENGE = gql`
  mutation CompleteChallenge($challengeId: ID!) {
    completeChallenge(challengeId: $challengeId) {
      id
      xp
      stardust
      level
    }
  }
`;

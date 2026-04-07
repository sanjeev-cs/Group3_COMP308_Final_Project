import { gql } from '@apollo/client';

export const GET_ME = gql`
  query Me {
    me {
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
`;

export const GET_MISSIONS = gql`
  query GetMissions {
    getMissions {
      id
      name
      description
      difficulty
      duration
      waves
      speed
      requiredLevel
      baseXP
      baseStardust
    }
  }
`;

export const GET_MY_PROGRESS = gql`
  query GetMyProgress {
    getMyProgress {
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

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($missionId: Int, $limit: Int) {
    getLeaderboard(missionId: $missionId, limit: $limit) {
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

export const GET_ACHIEVEMENTS = gql`
  query GetAchievements {
    getAchievements {
      id
      key
      name
      description
      icon
      xpReward
      stardustReward
    }
  }
`;

export const GET_MY_ACHIEVEMENTS = gql`
  query GetMyAchievements {
    getMyAchievements {
      id
      key
      name
      description
      icon
      xpReward
      stardustReward
    }
  }
`;

export const GET_ACTIVE_CHALLENGES = gql`
  query GetActiveChallenges {
    getActiveChallenges {
      id
      title
      description
      type
      condition {
        missionId
        metric
        threshold
      }
      xpReward
      stardustReward
      isActive
    }
  }
`;

export const GET_LEVEL_PROGRESS = gql`
  query GetLevelProgress {
    getLevelProgress {
      currentLevelXP
      xpForNextLevel
      totalXP
      level
    }
  }
`;

const typeDefs = `#graphql
  # ─── Types ───────────────────────────────────────────────

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String!
    level: Int!
    xp: Int!
    stardust: Int!
    unlockedPowerUps: [String!]!
    achievements: [String!]!
    stats: UserStats!
    createdAt: String!
  }

  type UserStats {
    gamesPlayed: Int!
    totalScore: Int!
    highestCombo: Int!
    totalAsteroidsDestroyed: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mission {
    id: Int!
    name: String!
    description: String!
    difficulty: String!
    duration: Int!
    waves: Int!
    speed: Float!
    requiredLevel: Int!
    baseXP: Int!
    baseStardust: Int!
  }

  type GameProgress {
    id: ID!
    userId: ID!
    missionId: Int!
    score: Int!
    wavesCompleted: Int!
    objectsDestroyed: Int!
    livesRemaining: Int!
    maxCombo: Int!
    starsEarned: Int!
    completed: Boolean!
    completedAt: String
    attempts: Int!
  }

  type Achievement {
    id: ID!
    key: String!
    name: String!
    description: String!
    icon: String!
    xpReward: Int!
    stardustReward: Int!
  }

  type LeaderboardEntry {
    id: ID!
    userId: ID!
    username: String!
    avatar: String!
    missionId: Int!
    score: Int!
    completedAt: String!
  }

  type Challenge {
    id: ID!
    title: String!
    description: String!
    type: String!
    condition: ChallengeCondition!
    xpReward: Int!
    stardustReward: Int!
    isActive: Boolean!
  }

  type ChallengeCondition {
    missionId: Int
    metric: String!
    threshold: Int!
  }

  type LevelProgress {
    currentLevelXP: Int!
    xpForNextLevel: Int!
    totalXP: Int!
    level: Int!
  }

  # ─── Inputs ──────────────────────────────────────────────

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    avatar: String
  }

  input GameResultInput {
    missionId: Int!
    score: Int!
    wavesCompleted: Int!
    objectsDestroyed: Int!
    livesRemaining: Int!
    maxCombo: Int!
    completed: Boolean!
  }

  # ─── Queries ─────────────────────────────────────────────

  type Query {
    me: User
    getMissions: [Mission!]!
    getMyProgress: [GameProgress!]!
    getMissionProgress(missionId: Int!): GameProgress
    getLeaderboard(missionId: Int, limit: Int): [LeaderboardEntry!]!
    getAchievements: [Achievement!]!
    getMyAchievements: [Achievement!]!
    getActiveChallenges: [Challenge!]!
    getLevelProgress: LevelProgress
  }

  # ─── Mutations ───────────────────────────────────────────

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    saveGameResult(input: GameResultInput!): GameProgress!
    purchasePowerUp(powerUpId: String!): User!
    claimAchievement(key: String!): User!
    completeChallenge(challengeId: ID!): User!
  }

  # ─── Subscriptions ──────────────────────────────────────

  type Subscription {
    scoreSubmitted(missionId: Int): LeaderboardEntry!
  }
`;

export default typeDefs;

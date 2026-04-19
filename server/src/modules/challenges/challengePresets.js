export const ACTIVE_CHALLENGE_PRESETS = [
  {
    title: 'Asteroid Hunter',
    description: 'Destroy 8 asteroids in The Minefield',
    type: 'daily',
    condition: { missionId: 1, metric: 'objectsDestroyed', threshold: 8 },
    xpReward: 30,
    stardustReward: 20,
    isActive: true,
  },
  {
    title: 'High Scorer',
    description: 'Score 120 or more points in any mission',
    type: 'daily',
    condition: { missionId: null, metric: 'score', threshold: 120 },
    xpReward: 40,
    stardustReward: 25,
    isActive: true,
  },
  {
    title: 'Combo Starter',
    description: 'Reach a 3x combo in any mission',
    type: 'daily',
    condition: { missionId: null, metric: 'maxCombo', threshold: 3 },
    xpReward: 25,
    stardustReward: 15,
    isActive: true,
  },
  {
    title: 'Marathon Runner',
    description: 'Play 4 games total',
    type: 'weekly',
    condition: { missionId: null, metric: 'gamesPlayed', threshold: 4 },
    xpReward: 80,
    stardustReward: 60,
    isActive: true,
  },
  {
    title: 'Storm Chaser',
    description: 'Score 180 or more on The Absurd Threat',
    type: 'weekly',
    condition: { missionId: 3, metric: 'score', threshold: 180 },
    xpReward: 100,
    stardustReward: 75,
    isActive: true,
  },
];

export const ACTIVE_CHALLENGE_PRESET_MAP = Object.fromEntries(
  ACTIVE_CHALLENGE_PRESETS.map((challenge) => [challenge.title, challenge]),
);

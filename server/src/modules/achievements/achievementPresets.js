export const ACHIEVEMENT_PRESETS = {
  first_contact: {
    name: 'First Contact',
    description: 'Complete your first mission',
    icon: '🚀',
    xpReward: 25,
    stardustReward: 15,
  },
  quick_draw: {
    name: 'Flight Hours',
    description: 'Play 5 missions total',
    icon: '⚡',
    xpReward: 50,
    stardustReward: 30,
  },
  lightning_reflexes: {
    name: 'Flight Hours',
    description: 'Play 5 missions total',
    icon: '⚡',
    xpReward: 50,
    stardustReward: 30,
  },
  untouchable: {
    name: 'Shielded Run',
    description: 'Complete any mission with at least 2 shield left',
    icon: '🛡️',
    xpReward: 75,
    stardustReward: 50,
  },
  combo_master: {
    name: 'Combo Master',
    description: 'Reach a 10x combo multiplier in a single mission',
    icon: '🔥',
    xpReward: 60,
    stardustReward: 40,
  },
  star_commander: {
    name: 'Star Commander',
    description: 'Complete all 3 missions',
    icon: '🏆',
    xpReward: 150,
    stardustReward: 100,
  },
  stardust_collector: {
    name: 'Stardust Collector',
    description: 'Earn 250 or more Stardust in total',
    icon: '💎',
    xpReward: 100,
    stardustReward: 50,
  },
};

export const DEFAULT_ACHIEVEMENTS = [
  'first_contact',
  'quick_draw',
  'untouchable',
  'combo_master',
  'star_commander',
  'stardust_collector',
].map((key, index) => ({
  id: `preset-${index + 1}`,
  key,
  ...ACHIEVEMENT_PRESETS[key],
}));

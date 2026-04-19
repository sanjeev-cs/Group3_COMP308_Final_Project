const KEY_ALIASES = {
  lightning_reflexes: 'quick_draw',
};

const SUPPORTED_ACHIEVEMENTS = {
  first_contact: true,
  quick_draw: true,
  lightning_reflexes: true,
  untouchable: true,
  combo_master: true,
  star_commander: true,
  stardust_collector: true,
};

const resolveAchievementKey = (key) => KEY_ALIASES[key] || key;

export const isSupportedAchievement = (key) => Boolean(SUPPORTED_ACHIEVEMENTS[key]);

export const canClaimAchievement = ({ key, user, progress }) => {
  const resolvedKey = resolveAchievementKey(key);
  const claimedKeys = new Set((user?.achievements || []).map(resolveAchievementKey));

  if (!user || claimedKeys.has(resolvedKey)) {
    return false;
  }

  const stats = user?.stats || {};

  switch (resolvedKey) {
    case 'first_contact':
      return progress.some((entry) => entry.completed);
    case 'quick_draw':
      return (stats.gamesPlayed || 0) >= 5;
    case 'untouchable':
      return progress.some((entry) => entry.completed && entry.livesRemaining >= 2);
    case 'combo_master':
      return (stats.highestCombo || 0) >= 10;
    case 'star_commander': {
      const completedIds = progress.filter((entry) => entry.completed).map((entry) => entry.missionId);
      return [1, 2, 3].every((id) => completedIds.includes(id));
    }
    case 'stardust_collector':
      return (user.stardust || 0) >= 250;
    default:
      return false;
  }
};

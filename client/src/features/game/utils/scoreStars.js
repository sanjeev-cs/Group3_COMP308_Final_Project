const STAR_THRESHOLDS = {
  1: [50, 120, 200],
  2: [100, 200, 350],
  3: [150, 300, 500],
};

export const getStarsForScore = (missionId, score) => {
  const thresholds = STAR_THRESHOLDS[missionId] || STAR_THRESHOLDS[1];

  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
};

export const MISSION_BRIEFINGS = {
  1: {
    title: 'Level 1 Briefing',
    destroy: [
      { label: 'Meteor', points: '+10' },
    ],
    avoid: 'Avoid mines: -15 score and -1 forcefield.',
  },
  2: {
    title: 'Level 2 Briefing',
    destroy: [
      { label: 'Ghost Boy', points: '+20' },
      { label: 'King Boo', points: '+30' },
    ],
    avoid: 'Avoid mines: -15 score and -1 forcefield.',
  },
  3: {
    title: 'Level 3 Briefing',
    destroy: [
      { label: 'Chuck', points: '+50' },
      { label: 'Red Angrybird', points: '+100' },
    ],
    avoid: 'Avoid mines: -15 score and -1 forcefield.',
  },
};

export const getMissionBriefing = (missionId) => MISSION_BRIEFINGS[missionId] || null;

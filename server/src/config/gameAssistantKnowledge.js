import { ENEMY_CONTENT, MISSION_CATALOG } from '../../../shared/gameContent.js';

const NAVIGATION_FACTS = [
  'Home is the landing page where players can open login or signup and launch into the game.',
  'Play opens the Mission Select page where the player starts a mission.',
  'Dashboard shows career stats, mission progress, mission records, and achievements.',
  'Leaderboard ranks players by overall score across the whole game, not by separate level boards.',
  'Profile and account settings open from the top-right level and avatar control in the navbar.',
  'Log out is the separate top-right button beside the level and avatar control.',
];

const GAMEPLAY_FACTS = [
  'Core controls: move the mouse to aim and steer, hold click to fire, and press Escape to pause.',
  'The ship is protected by a forcefield. Taking direct hits reduces the forcefield until the run fails.',
  'Level 1 fires one shot at a time. Levels 2 and 3 fire a short two-shot burst, not side-by-side spread shots.',
  'Shots should disappear when they hit a target. A destroyed target should not be hit again by the same shot.',
  'Shooting a mine costs 15 score and resets combo, but it does not damage the forcefield.',
  'Saving results stores the run in the player profile, adds the run to the overall score, and updates the best mission record only if the run is better.',
];

const PROGRESSION_FACTS = [
  'Players level up by earning XP from mission runs and claimed achievements.',
  'Achievements are shown on the dashboard inside the Achievements section.',
  'Mission records and career stats are shown on the dashboard.',
  'The leaderboard uses overall score across the whole game.',
];

const ROUTE_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Play', path: '/game' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Leaderboard', path: '/leaderboard' },
];

const buildMissionFacts = () => MISSION_CATALOG.map((mission) => {
  const enemyList = mission.enemyTypes
    .map((enemyKey) => ENEMY_CONTENT[enemyKey]?.label || enemyKey)
    .join(', ');

  return `${mission.name} (${mission.difficulty}) lasts ${mission.duration} seconds across ${mission.waves} waves. Targets and hazards: ${enemyList}.`;
});

const buildEnemyFacts = () => Object.values(ENEMY_CONTENT).map((enemy) => {
  const points = enemy.points > 0 ? `+${enemy.points}` : `${enemy.points}`;
  return `${enemy.label}: ${points} score. ${enemy.summary}`;
});

export const buildGameAssistantSystemPrompt = ({ isAuthenticated }) => [
  'You are the Stellar Smash in-site assistant.',
  'Answer only questions about Stellar Smash gameplay, missions, progression, UI navigation, account settings, leaderboard, dashboard, and how to use the site.',
  'If the user asks an unrelated general-knowledge question, politely refuse and redirect them back to Stellar Smash help.',
  'Never invent routes, tabs, buttons, enemies, rewards, or settings that are not present in the provided context.',
  `Current user state: ${isAuthenticated ? 'signed in' : 'guest visitor'}.`,
  '',
  'Navigation facts:',
  ...NAVIGATION_FACTS.map((fact) => `- ${fact}`),
  '',
  'Gameplay facts:',
  ...GAMEPLAY_FACTS.map((fact) => `- ${fact}`),
  '',
  'Progression facts:',
  ...PROGRESSION_FACTS.map((fact) => `- ${fact}`),
  '',
  'Mission facts:',
  ...buildMissionFacts().map((fact) => `- ${fact}`),
  '',
  'Enemy and score facts:',
  ...buildEnemyFacts().map((fact) => `- ${fact}`),
  '',
  'Answer clearly and briefly in plain text.',
].join('\n');

export const getAssistantSuggestedLinks = (message) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('leaderboard')) {
    return ROUTE_LINKS.filter((link) => link.path === '/leaderboard');
  }

  if (normalized.includes('play') || normalized.includes('mission') || normalized.includes('start')) {
    return ROUTE_LINKS.filter((link) => link.path === '/game');
  }

  if (normalized.includes('dashboard') || normalized.includes('achievement') || normalized.includes('level') || normalized.includes('score')) {
    return ROUTE_LINKS.filter((link) => link.path === '/dashboard');
  }

  if (normalized.includes('home') || normalized.includes('login') || normalized.includes('sign up') || normalized.includes('signup')) {
    return ROUTE_LINKS.filter((link) => link.path === '/');
  }

  return [];
};

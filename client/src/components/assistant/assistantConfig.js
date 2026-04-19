export const ASSISTANT_STARTER_PROMPTS = [
  'How do I play?',
  'Where is profile?',
  'How do I level up?',
];

export const shouldShowGameAssistant = (pathname, gameStatus) => !(
  pathname === '/game' && ['playing', 'paused'].includes(gameStatus)
);

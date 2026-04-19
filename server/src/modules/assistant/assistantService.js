import {
  buildGameAssistantSystemPrompt,
  getAssistantSuggestedLinks,
} from './assistantKnowledge.js';

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_HISTORY_ITEMS = 6;
const MAX_MESSAGE_LENGTH = 600;

const clampText = (value) => value.trim().slice(0, MAX_MESSAGE_LENGTH);

const sanitizeHistory = (history = []) => history
  .filter((item) => item && typeof item.content === 'string' && typeof item.role === 'string')
  .filter((item) => ['user', 'assistant'].includes(item.role))
  .map((item) => ({
    role: item.role,
    content: clampText(item.content),
  }))
  .filter((item) => item.content.length > 0)
  .slice(-MAX_HISTORY_ITEMS);

const buildFriendlyReply = (text, message) => ({
  available: false,
  text,
  suggestedLinks: getAssistantSuggestedLinks(message),
});

export const askGameAssistant = async ({ input, isAuthenticated }) => {
  const message = typeof input?.message === 'string' ? clampText(input.message) : '';

  if (!message) {
    return buildFriendlyReply(
      'Ask a question about Stellar Smash gameplay, missions, progression, or site navigation.',
      '',
    );
  }

  if (!process.env.GROQ_API_KEY) {
    return buildFriendlyReply(
      'Game help is unavailable right now because the server is missing GROQ_API_KEY.',
      message,
    );
  }

  const history = sanitizeHistory(input?.history);
  const systemPrompt = buildGameAssistantSystemPrompt({ isAuthenticated });

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 280,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message },
        ],
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return buildFriendlyReply(
        'Game help is temporarily unavailable. Please try again in a moment.',
        message,
      );
    }

    const text = payload?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return buildFriendlyReply(
        'Game help could not generate a reply right now. Please try again.',
        message,
      );
    }

    return {
      available: true,
      text,
      suggestedLinks: getAssistantSuggestedLinks(message),
    };
  } catch {
    return buildFriendlyReply(
      'Game help is temporarily unavailable. Please try again in a moment.',
      message,
    );
  }
};

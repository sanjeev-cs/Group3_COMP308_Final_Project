import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { ASK_GAME_ASSISTANT } from '../../graphql/mutations.js';
import useDocumentScrollLock from '../../hooks/useDocumentScrollLock.js';
import useGameplayState from '../../state/useGameplayState.js';
import { ASSISTANT_STARTER_PROMPTS, shouldShowGameAssistant } from './assistantConfig.js';
import './GameAssistantWidget.css';

const WELCOME_MESSAGE = {
  id: 'assistant-welcome',
  role: 'assistant',
  content: 'Ask about controls, missions, scoring, leveling, achievements, or where to find something in Stellar Smash.',
  suggestedLinks: [],
};

const getAssistantErrorMessage = (error) => {
  const graphQLErrorMessage = error?.graphQLErrors?.[0]?.message;
  const networkGraphQLErrorMessage = error?.networkError?.result?.errors?.[0]?.message;

  if (graphQLErrorMessage) return graphQLErrorMessage;
  if (networkGraphQLErrorMessage) return networkGraphQLErrorMessage;

  return 'Game help is unavailable right now. Check that the backend is updated and GROQ_API_KEY is configured.';
};

const buildMessage = (role, content, suggestedLinks = []) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  suggestedLinks,
});

const ClearIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M4.5 5.5h11M7.5 5.5V4.4c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9v1.1M8.1 8.3v5.3M11.9 8.3v5.3M6.5 5.5l.6 9.2c0 .7.6 1.3 1.3 1.3h3.2c.7 0 1.3-.6 1.3-1.3l.6-9.2"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const MinimizeIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M5 10h10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const GroqIcon = () => (
  <svg viewBox="0 0 209.604012 304.704012" aria-hidden="true">
    <path d="M105.304012.00401184C47.7040118-.49598816.50401184 45.8040118.00401184 103.404012c-.5 57.6 45.79999996 104.8 103.40000016 105.3h36.2v-39.1h-34.3c-36.0000002.4-65.6000002-28.4-66.0000002-64.5-.4-36.1000002 28.4-65.6000002 64.5000002-66.0000002h1.5c36 0 65.2 29.2 65.4 65.2000002v96.1c0 35.7-29.1 64.8-64.7 65.2-17.1000002-.1-33.4000002-7-45.4000002-19.1l-27.7 27.7c19.2 19.3 45.2 30.3 72.4000002 30.5h1.4c56.9-.8 102.6-47 102.9-103.9v-99.1c-1.4-56.5000002-47.7-101.60000016-104.3-101.70000016Z" />
  </svg>
);

const GameAssistantWidget = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const gameStatus = useGameplayState((state) => state.status);
  const visible = shouldShowGameAssistant(pathname, gameStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef(null);
  const [askAssistant] = useMutation(ASK_GAME_ASSISTANT);

  useDocumentScrollLock(visible && isOpen);

  useEffect(() => {
    if (!visible) {
      setIsOpen(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!isOpen) return;
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [isOpen, messages]);

  if (!visible) {
    return null;
  }

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    const nextUserMessage = buildMessage('user', message);
    const history = messages
      .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
      }))
      .slice(-6);

    setMessages((current) => [...current, nextUserMessage]);
    setDraft('');
    setIsSending(true);

    try {
      const { data } = await askAssistant({
        variables: {
          input: {
            message,
            history,
          },
        },
      });

      const reply = data?.askGameAssistant;
      setMessages((current) => [
        ...current,
        buildMessage(
          'assistant',
          reply?.text || 'Game help is temporarily unavailable. Please try again.',
          reply?.suggestedLinks || [],
        ),
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        buildMessage(
          'assistant',
          getAssistantErrorMessage(error),
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`game-assistant ${isOpen ? 'is-open' : ''}`}>
      {isOpen ? (
        <div className="game-assistant-panel" aria-live="polite">
          <div className="game-assistant-header">
            <div className="game-assistant-title">
              <strong>Game Help</strong>
              <span>Stellar Smash site and gameplay assistant</span>
            </div>
            <div className="game-assistant-header-actions">
              <button
                type="button"
                className="game-assistant-header-btn"
                onClick={() => setMessages([WELCOME_MESSAGE])}
                aria-label="Clear assistant messages"
                title="Clear"
              >
                <ClearIcon />
              </button>
              <button
                type="button"
                className="game-assistant-header-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize game help"
                title="Minimize"
              >
                <MinimizeIcon />
              </button>
            </div>
          </div>

          {messages.length === 1 ? (
            <div className="game-assistant-starters">
              {ASSISTANT_STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="game-assistant-starter"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="game-assistant-messages" ref={messagesRef}>
            {messages.map((message) => (
              <div key={message.id} className={`game-assistant-message ${message.role}`}>
                <p>{message.content}</p>
                {message.suggestedLinks?.length ? (
                  <div className="game-assistant-links">
                    {message.suggestedLinks.map((link) => (
                      <button
                        key={`${message.id}-${link.path}`}
                        type="button"
                        className="game-assistant-link"
                        onClick={() => navigate(link.path)}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {isSending ? <div className="game-assistant-typing">Thinking...</div> : null}

          <form
            className="game-assistant-compose"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
          >
            <input
              className="game-assistant-input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about Stellar Smash..."
              maxLength={600}
            />
            <button
              type="submit"
              className="btn btn-primary game-assistant-send"
              disabled={isSending || !draft.trim()}
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className={`game-assistant-launcher ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close game help' : 'Open game help'}
        title="Groq help"
      >
        <span className="game-assistant-launcher-logo" aria-hidden="true">
          <GroqIcon />
        </span>
      </button>
    </div>
  );
};

export default GameAssistantWidget;

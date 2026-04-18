import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { ASK_GAME_ASSISTANT } from '../../graphql/mutations.js';
import useGameStore from '../../store/gameStore.js';
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

const GameAssistantWidget = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const gameStatus = useGameStore((state) => state.status);
  const visible = shouldShowGameAssistant(pathname, gameStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef(null);
  const [askAssistant] = useMutation(ASK_GAME_ASSISTANT);

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
    <div className="game-assistant">
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
              >
                Clear
              </button>
              <button
                type="button"
                className="game-assistant-header-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize game help"
                title="Minimize"
              >
                -
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
        className="game-assistant-launcher"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close game help' : 'Open game help'}
        title="AI help"
      >
        AI
      </button>
    </div>
  );
};

export default GameAssistantWidget;

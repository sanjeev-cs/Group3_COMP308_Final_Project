import useGameStore from '../../store/gameStore.js';
import './HUD.css';

/**
 * Heads-up display — overlaid on the 3D canvas.
 * Shows score, combo, lives, timer, and a targeting reticle.
 */
const HUD = () => {
  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const lives = useGameStore((s) => s.lives);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const status = useGameStore((s) => s.status);

  if (status !== 'playing') return null;

  const comboMultiplier = 1 + Math.floor(combo / 5) * 0.5;
  const isLowTime = timeRemaining <= 10;

  return (
    <div className="hud" id="game-hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-score">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score}</span>
        </div>

        <div className={`hud-timer ${isLowTime ? 'hud-timer-low' : ''}`}>
          <span className="hud-label">Time</span>
          <span className="hud-value">{Math.ceil(timeRemaining)}s</span>
        </div>

        <div className="hud-lives">
          <span className="hud-label">Hull</span>
          <span className="hud-value hud-hearts">
            {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
          </span>
        </div>
      </div>

      {/* Center reticle */}
      <div className="hud-reticle">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="25" stroke="rgba(77,159,255,0.2)" strokeWidth="1" />
          <circle cx="30" cy="30" r="12" stroke="rgba(77,159,255,0.3)" strokeWidth="1" />
          <line x1="30" y1="0" x2="30" y2="18" stroke="rgba(77,159,255,0.3)" strokeWidth="1" />
          <line x1="30" y1="42" x2="30" y2="60" stroke="rgba(77,159,255,0.3)" strokeWidth="1" />
          <line x1="0" y1="30" x2="18" y2="30" stroke="rgba(77,159,255,0.3)" strokeWidth="1" />
          <line x1="42" y1="30" x2="60" y2="30" stroke="rgba(77,159,255,0.3)" strokeWidth="1" />
        </svg>
      </div>

      {/* Combo display */}
      {combo > 0 && (
        <div className="hud-combo">
          <span className="combo-count">{combo}×</span>
          <span className="combo-multiplier">{comboMultiplier.toFixed(1)}x multiplier</span>
        </div>
      )}

      {/* Bottom legend */}
      <div className="hud-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#8B7355' }} />Asteroid +10
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} />Drone +20
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#00e5ff' }} />Energy +15
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ffd700' }} />Stardust +25
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ff0033', boxShadow: '0 0 6px #ff0033' }} />Mine ⚠️
        </span>
      </div>

      {/* Corner scanlines effect */}
      <div className="hud-scanline" />
    </div>
  );
};

export default HUD;

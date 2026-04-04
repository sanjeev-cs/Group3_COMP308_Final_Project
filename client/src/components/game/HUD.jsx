import useGameStore from '../../store/gameStore.js';
import './HUD.css';

/**
 * Heads-up display — overlaid on the 3D canvas.
 * Shows score, combo, lives, and time remaining.
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
          <span className="hud-label">Lives</span>
          <span className="hud-value">
            {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
          </span>
        </div>
      </div>

      {combo > 0 && (
        <div className="hud-combo">
          <span className="combo-count">{combo}×</span>
          <span className="combo-multiplier">({comboMultiplier.toFixed(1)}x)</span>
        </div>
      )}

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
          <span className="legend-dot" style={{ background: '#ff2222' }} />Mine ⚠️
        </span>
      </div>
    </div>
  );
};

export default HUD;

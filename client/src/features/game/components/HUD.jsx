import { useEffect, useState, useRef } from 'react';
import useGameplayState from '../state/useGameplayState.js';
import './HUD.css';

const HUD = () => {
  const score = useGameplayState((state) => state.score);
  const combo = useGameplayState((state) => state.combo);
  const lives = useGameplayState((state) => state.lives);
  const time = useGameplayState((state) => state.timeRemaining);
  const status = useGameplayState((state) => state.status);
  const destroyed = useGameplayState((state) => state.objectsDestroyed);

  const [popups, setPopups] = useState([]);
  const previousScore = useRef(0);

  useEffect(() => {
    const scoreDiff = score - previousScore.current;
    if (scoreDiff !== 0 && status === 'playing') {
      const id = Date.now() + Math.random();
      const x = (Math.random() - 0.5) * 80;
      setPopups((current) => [
        ...current,
        { id, value: scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`, x, positive: scoreDiff > 0 },
      ]);
      setTimeout(() => setPopups((current) => current.filter((popup) => popup.id !== id)), 1000);
    }
    previousScore.current = score;
  }, [score, status]);

  if (status !== 'playing') return null;

  const lowTime = time <= 10;
  const multiplier = 1 + Math.floor(combo / 5) * 0.5;

  return (
    <div className="hud" id="game-hud">
      <div className="hud-score hud-panel">
        <div className="hud-score-num">{score}</div>
        <div className="hud-score-label">{destroyed} destroyed</div>
      </div>

      <div className="hud-timer hud-panel">
        <div className={`hud-timer-num ${lowTime ? 'low' : ''}`}>{Math.ceil(time)}</div>
        <div className="hud-timer-label">seconds left</div>
      </div>

      {combo >= 3 && (
        <div className="hud-combo hud-panel">
          <span className="hud-combo-num">{combo}x</span>
          <span className="hud-combo-label">combo {multiplier.toFixed(1)}x score</span>
        </div>
      )}

      <div className="hud-lives hud-panel">
        <div className="hud-lives-label">Ship Forcefield</div>
        <div className="hud-lives-bars">
          {[0, 1, 2].map((index) => (
            <div key={index} className={`hud-life ${index < lives ? 'on' : 'off'}`} />
          ))}
        </div>
      </div>

      <div className="hud-popups">
        {popups.map((popup) => (
          <div key={popup.id} className={`hud-popup ${popup.positive ? 'pos' : 'neg'}`} style={{ left: popup.x }}>
            {popup.value}
          </div>
        ))}
      </div>

      <div className="hud-hint">Move mouse to aim, ship trails behind, hold click to fire</div>
    </div>
  );
};

export default HUD;

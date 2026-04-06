import { useEffect, useState, useRef } from 'react';
import useGameStore from '../../store/gameStore.js';
import './HUD.css';

const HUD = () => {
  const score    = useGameStore(s => s.score);
  const combo    = useGameStore(s => s.combo);
  const lives    = useGameStore(s => s.lives);
  const time     = useGameStore(s => s.timeRemaining);
  const status   = useGameStore(s => s.status);
  const destroyed= useGameStore(s => s.objectsDestroyed);
  const setStatus = useGameStore(s => s.setStatus);

  const [popups, setPopups] = useState([]);
  const prev = useRef(0);

  useEffect(() => {
    const diff = score - prev.current;
    if (diff !== 0 && status === 'playing') {
      const id = Date.now() + Math.random();
      const x = (Math.random() - 0.5) * 80;
      setPopups(p => [...p, { id, value: diff > 0 ? `+${diff}` : `${diff}`, x, positive: diff > 0 }]);
      setTimeout(() => setPopups(p => p.filter(v => v.id !== id)), 1000);
    }
    prev.current = score;
  }, [score, status]);

  if (status !== 'playing') return null;

  const low = time <= 10;
  const mult = 1 + Math.floor(combo / 5) * 0.5;

  return (
    <div className="hud" id="game-hud">
      {/* Score */}
      <div className="hud-score">
        <div className="hud-score-num">{score}</div>
        <div className="hud-score-label">{destroyed} destroyed</div>
      </div>

      {/* Timer */}
      <div className="hud-timer">
        <div className={`hud-timer-num ${low ? 'low' : ''}`}>{Math.ceil(time)}</div>
        <div className="hud-timer-label">seconds</div>
      </div>

      {/* Combo */}
      {combo >= 3 && (
        <div className="hud-combo">
          <span className="hud-combo-num">{combo}×</span>
          <span className="hud-combo-label">{mult.toFixed(1)}x</span>
        </div>
      )}

      {/* Lives */}
      <div className="hud-lives">
        {[0, 1, 2].map(i => (
          <div key={i} className={`hud-life ${i < lives ? 'on' : 'off'}`} />
        ))}
      </div>

      {/* Crosshair (Moved to 3D) */}

      {/* Score popups */}
      <div className="hud-popups">
        {popups.map(p => (
          <div key={p.id} className={`hud-popup ${p.positive ? 'pos' : 'neg'}`} style={{ left: p.x }}>
            {p.value}
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="hud-hint">Move mouse to steer · Hold click to shoot</div>

      {/* Abort */}
      <button className="hud-abort-btn" onClick={() => setStatus('failed')} style={{
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
        background: 'transparent', border: '1px solid #78716c', color: '#a8a29e',
        padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '4px',
        pointerEvents: 'auto'
      }}>
        Abort Mission
      </button>
    </div>
  );
};

export default HUD;

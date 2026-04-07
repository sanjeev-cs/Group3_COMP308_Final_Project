import { useEffect, useState, useRef } from 'react';
import useGameStore from '../../store/gameStore.js';
import { getMissionBriefing } from './missionBriefings.js';
import { getAudioMuted, setAudioMuted } from './gameSoundManager.js';
import './HUD.css';

const HUD = () => {
  const score = useGameStore((state) => state.score);
  const combo = useGameStore((state) => state.combo);
  const lives = useGameStore((state) => state.lives);
  const time = useGameStore((state) => state.timeRemaining);
  const status = useGameStore((state) => state.status);
  const destroyed = useGameStore((state) => state.objectsDestroyed);
  const missionId = useGameStore((state) => state.missionId);
  const setStatus = useGameStore((state) => state.setStatus);

  const [popups, setPopups] = useState([]);
  const [showBriefing, setShowBriefing] = useState(true);
  const [muted, setMuted] = useState(getAudioMuted);
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

  useEffect(() => {
    if (status !== 'playing') {
      setShowBriefing(false);
      return undefined;
    }

    setShowBriefing(true);
    const timeout = window.setTimeout(() => setShowBriefing(false), 6500);
    return () => window.clearTimeout(timeout);
  }, [missionId, status]);

  if (status !== 'playing') return null;

  const lowTime = time <= 10;
  const multiplier = 1 + Math.floor(combo / 5) * 0.5;
  const briefing = getMissionBriefing(missionId);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  return (
    <div className="hud" id="game-hud">
      {showBriefing && briefing && (
        <div className="hud-briefing hud-panel">
          <div className="hud-briefing-kicker">{briefing.title}</div>
          <div className="hud-briefing-heading">Destroy for points</div>
          <div className="hud-briefing-targets">
            {briefing.destroy.map((target) => (
              <div key={target.label} className="hud-briefing-target">
                <span>{target.label}</span>
                <strong>{target.points}</strong>
              </div>
            ))}
          </div>
          <div className="hud-briefing-avoid">{briefing.avoid}</div>
        </div>
      )}

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

      <button className="hud-sound-btn" onClick={handleToggleMute} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>
        {muted ? '🔇' : '🔊'}
      </button>

      <button className="hud-abort-btn" onClick={() => setStatus('failed')}>
        Abort Mission
      </button>
    </div>
  );
};

export default HUD;

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MISSIONS } from '../graphql/queries.js';
import { SAVE_GAME_RESULT } from '../graphql/mutations.js';
import useGameStore from '../store/gameStore.js';
import GameCanvas from '../components/game/GameCanvas.jsx';
import './GamePage.css';

const CONFIGS = {
  1: { duration: 60, waves: 8,  objectsPerWave: { min: 1, max: 2 }, speed: 0.8, pool: ['meteor', 'mine'] },
  2: { duration: 50, waves: 12, objectsPerWave: { min: 2, max: 3 }, speed: 1.0, pool: ['ghost_boy', 'king_boo'] },
  3: { duration: 45, waves: 15, objectsPerWave: { min: 2, max: 4 }, speed: 1.3, pool: ['boss', 'chuck'] },
};

const UI_OVERRIDES = {
  1: { name: 'The Minefield', desc: 'Classic survival. Learn to dodge meteors and mines.' },
  2: { name: 'Alien Swarm', desc: 'Faster enemies including Buster Drones and Alien Metroids.' },
  3: { name: 'The Absurd Threat', desc: 'Maximum speed! Survive the Boss and Angry Bird.' },
};

const GamePage = () => {
  const { user, refreshUser } = useAuth();
  const { data } = useQuery(GET_MISSIONS);
  const missions = data?.getMissions || [];

  const status    = useGameStore(s => s.status);
  const score     = useGameStore(s => s.score);
  const lives     = useGameStore(s => s.lives);
  const maxCombo  = useGameStore(s => s.maxCombo);
  const waves     = useGameStore(s => s.wavesCompleted);
  const destroyed = useGameStore(s => s.objectsDestroyed);
  const mId       = useGameStore(s => s.missionId);
  const start     = useGameStore(s => s.startMission);
  const reset     = useGameStore(s => s.reset);

  useEffect(() => () => reset(), [reset]);

  const [result, setResult] = useState(null);
  const [saveResult] = useMutation(SAVE_GAME_RESULT, {
    onCompleted: d => { setResult(d.saveGameResult); refreshUser(); },
  });

  const launch = useCallback(id => {
    const cfg = CONFIGS[id];
    if (!cfg) return;
    setResult(null);
    start(id, cfg);
  }, [start]);

  const save = useCallback(() => {
    saveResult({
      variables: {
        input: {
          missionId: mId, score, wavesCompleted: waves,
          objectsDestroyed: destroyed, livesRemaining: lives,
          maxCombo, completed: status === 'completed',
        },
      },
    });
  }, [status, mId, score, waves, destroyed, lives, maxCombo, saveResult]);

  // Active game
  if (status === 'playing') {
    return <div className="game-page game-active" id="game-active"><GameCanvas /></div>;
  }

  // Result
  if (status === 'completed' || status === 'failed') {
    const win = status === 'completed';
    const stars = result?.starsEarned ?? 0;
    return (
      <div className="game-page result-page" id="game-result">
        <div className="result-box">
          <div className={`result-status ${win ? 'win' : 'fail'}`}>
            {win ? 'Mission complete' : 'Mission failed'}
          </div>
          <h1 className="result-title">{win ? 'Nice flying.' : 'Ship lost.'}</h1>
          <p className="result-sub">{win ? 'Your run has been recorded.' : 'Better luck next time.'}</p>

          {result && (
            <div className="result-stars">
              {[1,2,3].map(i => (
                <span key={i} className={`result-star ${i <= stars ? 'on' : 'off'}`}>{i <= stars ? '★' : '☆'}</span>
              ))}
            </div>
          )}

          <div className="result-stats stat-grid">
            <div className="stat-item"><div className="stat-value">{score}</div><div className="stat-label">Score</div></div>
            <div className="stat-item"><div className="stat-value">{maxCombo}×</div><div className="stat-label">Best combo</div></div>
            <div className="stat-item"><div className="stat-value">{destroyed}</div><div className="stat-label">Destroyed</div></div>
            <div className="stat-item"><div className="stat-value">{lives}</div><div className="stat-label">Hull left</div></div>
          </div>

          {result && <div className="result-saved">Result saved — {result.starsEarned}/3 stars</div>}

          <div className="result-actions">
            {!result && <button className="btn btn-gold" onClick={save} id="save-result-btn">Save result</button>}
            <button className="btn btn-primary" onClick={() => launch(mId)} id="retry-btn">Retry</button>
            <button className="btn btn-secondary" onClick={() => { reset(); setResult(null); }} id="back-to-select-btn">Back</button>
          </div>
        </div>
      </div>
    );
  }

  // Mission select
  return (
    <div className="game-page mission-page" id="game-page">
      <h1>Missions</h1>
      <p>Pick a sector. Each one is harder than the last.</p>

      <div className="mission-list">
        {missions.map(m => {
          const locked = false; // Unlocked from the beginning
          const dc = m.difficulty.toLowerCase();
          const ui = UI_OVERRIDES[m.id] || m;
          return (
            <div key={m.id} className={`mission-item ${locked ? 'locked' : ''}`}>
              <div className="mission-item-head">
                <span className={`badge badge-${dc}`}>{m.difficulty}</span>
                <h2>{ui.name}</h2>
              </div>
              <p>{ui.desc}</p>
              <div className="mission-meta">
                <span>{m.duration}s</span>
                <span>{m.waves} waves</span>
                <span>{m.speed}× speed</span>
                <span>+{m.baseXP} XP</span>
                <span>+{m.baseStardust} dust</span>
              </div>
              {locked
                ? <span className="mission-locked-text">Requires level {m.requiredLevel}</span>
                : <button className="btn btn-primary" onClick={() => launch(m.id)} id={`start-mission-${m.id}`}>Start</button>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamePage;

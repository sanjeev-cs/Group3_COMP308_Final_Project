import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MISSIONS } from '../graphql/queries.js';
import { SAVE_GAME_RESULT } from '../graphql/mutations.js';
import useGameStore from '../store/gameStore.js';
import GameCanvas from '../components/game/GameCanvas.jsx';
import './GamePage.css';

// Mission configs matching the server MISSIONS data for client-side use
const MISSION_CONFIGS = {
  1: { duration: 60, waves: 8, objectsPerWave: { min: 3, max: 4 }, speed: 1 },
  2: { duration: 50, waves: 12, objectsPerWave: { min: 4, max: 6 }, speed: 1.5 },
  3: { duration: 45, waves: 15, objectsPerWave: { min: 5, max: 8 }, speed: 2 },
};

const GamePage = () => {
  const { user, refreshUser } = useAuth();
  const { data: missionsData } = useQuery(GET_MISSIONS);
  const missions = missionsData?.getMissions || [];

  const status = useGameStore((s) => s.status);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const wavesCompleted = useGameStore((s) => s.wavesCompleted);
  const objectsDestroyed = useGameStore((s) => s.objectsDestroyed);
  const missionId = useGameStore((s) => s.missionId);
  const startMission = useGameStore((s) => s.startMission);
  const reset = useGameStore((s) => s.reset);

  const [lastResult, setLastResult] = useState(null);

  const [saveResult] = useMutation(SAVE_GAME_RESULT, {
    onCompleted: (data) => {
      setLastResult(data.saveGameResult);
      refreshUser();
    },
  });

  const handleStartMission = useCallback((id) => {
    const config = MISSION_CONFIGS[id];
    if (!config) return;
    setLastResult(null);
    startMission(id, config);
  }, [startMission]);

  const handleSaveAndReturn = useCallback(() => {
    const completed = status === 'completed';
    saveResult({
      variables: {
        input: {
          missionId,
          score,
          wavesCompleted,
          objectsDestroyed,
          livesRemaining: lives,
          maxCombo,
          completed,
        },
      },
    });
  }, [status, missionId, score, wavesCompleted, objectsDestroyed, lives, maxCombo, saveResult]);

  const handleBackToSelect = useCallback(() => {
    reset();
    setLastResult(null);
  }, [reset]);

  // ─── Mission Select Screen ───────────────────────────
  if (status === 'idle') {
    return (
      <div className="game-page page" id="game-page">
        <div className="container">
          <h1 className="page-title">Select Mission</h1>
          <p className="page-subtitle">Choose your battlefield, Commander.</p>

          <div className="mission-select-grid">
            {missions.map((m) => {
              const locked = user.level < m.requiredLevel;
              return (
                <div className={`card mission-select-card ${locked ? 'locked' : ''}`} key={m.id}>
                  <span className={`badge badge-${m.difficulty.toLowerCase()}`}>{m.difficulty}</span>
                  <h2>{m.name}</h2>
                  <p>{m.description}</p>
                  <div className="mission-meta">
                    <span>⏱ {m.duration}s</span>
                    <span>🌊 {m.waves} waves</span>
                    <span>⚡ Speed {m.speed}x</span>
                  </div>
                  <div className="mission-rewards-preview">
                    <span>+{m.baseXP} XP</span>
                    <span>+{m.baseStardust} 💎</span>
                  </div>
                  {locked ? (
                    <div className="mission-locked">
                      🔒 Requires Level {m.requiredLevel}
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStartMission(m.id)}
                      id={`start-mission-${m.id}`}
                    >
                      🚀 Launch
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Game Over / Complete Screen ─────────────────────
  if (status === 'completed' || status === 'failed') {
    const isWin = status === 'completed';

    return (
      <div className="game-page page" id="game-result">
        <div className="container result-container">
          <div className="card result-card animate-fadeIn">
            <div className="result-icon">{isWin ? '🏆' : '💥'}</div>
            <h1>{isWin ? 'Mission Complete!' : 'Mission Failed!'}</h1>
            <p className="result-subtitle">
              {isWin ? 'Great job, Commander!' : 'Better luck next time!'}
            </p>

            <div className="stat-grid result-stats">
              <div className="stat-item">
                <div className="stat-value">{score}</div>
                <div className="stat-label">Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{maxCombo}×</div>
                <div className="stat-label">Best Combo</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{objectsDestroyed}</div>
                <div className="stat-label">Destroyed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{'❤️'.repeat(lives)}</div>
                <div className="stat-label">Lives Left</div>
              </div>
            </div>

            {lastResult && (
              <div className="result-saved">
                <p>⭐ Stars: {lastResult.starsEarned}/3</p>
                <p>Progress saved!</p>
              </div>
            )}

            <div className="result-actions">
              {!lastResult && (
                <button className="btn btn-gold" onClick={handleSaveAndReturn} id="save-result-btn">
                  💾 Save Result
                </button>
              )}
              <button className="btn btn-primary" onClick={() => handleStartMission(missionId)} id="retry-btn">
                🔄 Retry
              </button>
              <button className="btn btn-secondary" onClick={handleBackToSelect} id="back-to-select-btn">
                ← Missions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Game Screen ──────────────────────────────
  return (
    <div className="game-page game-active" id="game-active">
      <GameCanvas />
    </div>
  );
};

export default GamePage;

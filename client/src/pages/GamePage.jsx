import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import { getMissionMeta } from '../features/game/constants/missionMeta.js';
import { playDamageSound, playMissionEndSound, playUiConfirmSound, resumeGameAudio, setGameplayMusicEnabled } from '../features/game/audio/gameSoundManager.js';
import GameCanvas from '../features/game/components/GameCanvas.jsx';
import useGameplayState from '../features/game/state/useGameplayState.js';
import { GET_MISSIONS } from '../graphql/queries.js';
import { SAVE_GAME_RESULT } from '../graphql/mutations.js';
import PageShell from '../shared/components/layout/PageShell.jsx';
import './GamePage.css';

const CONFIGS = {
  1: {
    duration: 60,
    waves: 8,
    objectsPerWave: { min: 1, max: 2 },
    speed: 0.85,
    spawnInterval: 0.95,
    maxActiveEnemies: 3,
    weapon: { cooldown: 0.34, projectiles: 1, burstInterval: 0, spread: 0, depthStep: 0 },
    pool: ['meteor', 'mine'],
  },
  2: {
    duration: 60,
    waves: 14,
    objectsPerWave: { min: 2, max: 4 },
    speed: 1.38,
    spawnInterval: 0.64,
    maxActiveEnemies: 5,
    weapon: { cooldown: 0.34, projectiles: 1, burstInterval: 0, spread: 0, depthStep: 0 },
    pool: ['ghost_boy', 'king_boo', 'mine'],
  },
  3: {
    duration: 60,
    waves: 18,
    objectsPerWave: { min: 3, max: 5 },
    speed: 1.72,
    spawnInterval: 0.48,
    maxActiveEnemies: 6,
    weapon: { cooldown: 0.28, projectiles: 1, burstInterval: 0, spread: 0, depthStep: 0 },
    pool: ['boss', 'chuck', 'mine'],
  },
};

const GamePage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { data } = useQuery(GET_MISSIONS);
  const missions = data?.getMissions || [];

  const status = useGameplayState((state) => state.status);
  const score = useGameplayState((state) => state.score);
  const lives = useGameplayState((state) => state.lives);
  const maxCombo = useGameplayState((state) => state.maxCombo);
  const waves = useGameplayState((state) => state.wavesCompleted);
  const destroyed = useGameplayState((state) => state.objectsDestroyed);
  const missionId = useGameplayState((state) => state.missionId);
  const startMission = useGameplayState((state) => state.startMission);
  const reset = useGameplayState((state) => state.reset);
  const setStatus = useGameplayState((state) => state.setStatus);

  const previousStatus = useRef(status);
  const previousLives = useRef(lives);
  const [result, setResult] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (status !== 'playing') return;

      event.preventDefault();
      setStatus('paused');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStatus, status]);

  useEffect(() => {
    if (status === 'paused') {
      document.exitPointerLock?.();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'idle' || status === 'completed' || status === 'failed') {
      setIsLaunching(false);
      setIsCanvasReady(false);
    }
  }, [status]);

  useEffect(() => {
    setGameplayMusicEnabled(status === 'playing');

    return () => {
      setGameplayMusicEnabled(false);
    };
  }, [status]);

  useEffect(() => {
    if (lives < previousLives.current) {
      playDamageSound();
    }
    previousLives.current = lives;
  }, [lives, status]);

  useEffect(() => {
    if (previousStatus.current !== status && (status === 'completed' || status === 'failed')) {
      if (!(status === 'failed' && lives <= 0)) {
        playMissionEndSound(status);
      }
    }
    previousStatus.current = status;
  }, [lives, status]);

  const [saveResult] = useMutation(SAVE_GAME_RESULT, {
    onCompleted: (payload) => {
      setResult(payload.saveGameResult);
      refreshUser();
      playUiConfirmSound();
    },
  });

  const launchMission = useCallback((id) => {
    const config = CONFIGS[id];
    if (!config) return;

    resumeGameAudio();
    playUiConfirmSound();
    setResult(null);
    setIsLaunching(true);
    setIsCanvasReady(false);
    startMission(id, config);
  }, [startMission]);

  const handleCanvasReady = useCallback(() => {
    setIsCanvasReady(true);
    setIsLaunching(false);
  }, []);

  const saveMission = useCallback(() => {
    saveResult({
      variables: {
        input: {
          missionId,
          score,
          wavesCompleted: waves,
          objectsDestroyed: destroyed,
          livesRemaining: lives,
          maxCombo,
          completed: status === 'completed',
        },
      },
    });
  }, [destroyed, lives, maxCombo, missionId, saveResult, score, status, waves]);

  if (status === 'playing' || status === 'paused') {
    return (
      <PageShell showHeader={false} className="game-shell" contentClassName="game-shell-content">
        <div className={`game-page game-active ${isCanvasReady ? 'game-active-ready' : 'game-active-loading'}`} id="game-active">
          <GameCanvas onReady={handleCanvasReady} className="game-active-canvas" />
          {(isLaunching || !isCanvasReady) && (
            <div className="game-launch-curtain">
              <div className="game-launch-copy">
                <span className="game-launch-kicker">Launching mission</span>
                <span className="game-launch-label">Stabilizing jump corridor...</span>
              </div>
            </div>
          )}
          {status === 'paused' && (
            <div className="game-pause-overlay">
              <div className="game-pause-card">
                <span className="game-pause-kicker">Mission paused</span>
                <h2>Pause Menu</h2>
                <div className="game-pause-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      resumeGameAudio();
                      setStatus('playing');
                    }}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      reset();
                      setResult(null);
                      navigate('/game');
                    }}
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageShell>
    );
  }

  if (status === 'completed' || status === 'failed') {
    const win = status === 'completed';

    return (
      <PageShell centered showHeader={false} className="result-shell">
        <div className="game-page result-page" id="game-result">
          <div className="result-box card">
            <div className="result-topbar">
              <Link to="/dashboard" className="page-back-btn result-back-btn">
                <span className="page-back-arrow">&lt;</span>
                <span>Dashboard</span>
              </Link>
              <div className={`result-status ${win ? 'win' : 'fail'}`}>
                {win ? 'Sector cleared' : 'Forcefield down'}
              </div>
            </div>
            <h1 className="result-title">{win ? 'Mission complete' : 'Mission failed'}</h1>
            <p className="result-sub">{win ? 'Your run is ready to save.' : 'Reset, relaunch, and push a better score.'}</p>

            <div className="result-stats stat-grid">
              <div className="stat-item"><div className="stat-value">{score}</div><div className="stat-label">Score</div></div>
              <div className="stat-item"><div className="stat-value">{maxCombo}x</div><div className="stat-label">Best Combo</div></div>
              <div className="stat-item"><div className="stat-value">{destroyed}</div><div className="stat-label">Destroyed</div></div>
              <div className="stat-item"><div className="stat-value">{lives}</div><div className="stat-label">Forcefield Left</div></div>
            </div>

            <div className="result-note">
              Save To Profile stores this run in your profile, adds it to your overall score, and only replaces your best mission record if this run is better.
            </div>

            {result && (
              <div className="result-saved">Run saved to your profile.</div>
            )}

            <div className="result-actions">
              {!result && <button className="btn btn-gold" onClick={saveMission} id="save-result-btn">Save To Profile</button>}
              <button className="btn btn-primary" onClick={() => launchMission(missionId)} id="retry-btn">Retry</button>
              <button className="btn btn-secondary" onClick={() => { reset(); setResult(null); }} id="back-to-select-btn">Mission Select</button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Mission Select"
      subtitle="Pick a sector, launch a run, and push your score into the leaderboard."
      backTo="/dashboard"
      backLabel="Dashboard"
    >
      <div className="game-page mission-page" id="game-page">
        <div className="mission-list">
          {missions.map((mission) => {
            const difficultyClass = mission.difficulty.toLowerCase();
            const meta = getMissionMeta(mission.id);
            const uiMission = meta ? { ...mission, name: meta.name, desc: meta.selectDesc } : mission;

            return (
              <div key={mission.id} className={`mission-item card mission-item-${difficultyClass}`}>
                <div className="mission-item-head">
                  <span className={`badge badge-${difficultyClass}`}>{mission.difficulty}</span>
                  <h2>{uiMission.name}</h2>
                </div>
                <p>{uiMission.desc}</p>
                <div className="mission-meta">
                  <span>{mission.duration}s</span>
                  <span>{mission.waves} waves</span>
                  <span>{mission.speed}x speed</span>
                  <span>+{mission.baseXP} XP</span>
                </div>
                <button className="btn btn-primary" onClick={() => launchMission(mission.id)} id={`start-mission-${mission.id}`}>
                  Start Mission
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default GamePage;

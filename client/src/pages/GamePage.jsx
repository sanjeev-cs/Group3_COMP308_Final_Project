import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MISSIONS } from '../graphql/queries.js';
import { SAVE_GAME_RESULT } from '../graphql/mutations.js';
import PageShell from '../components/layout/PageShell.jsx';
import GameCanvas from '../components/game/GameCanvas.jsx';
import useGameStore from '../store/gameStore.js';
import { playDamageSound, playMissionEndSound, playUiConfirmSound, resumeGameAudio, setGameplayMusicEnabled } from '../components/game/gameSoundManager.js';
import { getMissionMeta } from '../constants/missionMeta.js';
import './GamePage.css';

const CONFIGS = {
  1: {
    duration: 60,
    waves: 8,
    objectsPerWave: { min: 1, max: 2 },
    speed: 0.85,
    spawnInterval: 0.95,
    maxActiveEnemies: 3,
    weapon: { cooldown: 0.34, projectiles: 1, spread: 0, depthStep: 0 },
    pool: ['meteor', 'mine'],
  },
  2: {
    duration: 48,
    waves: 14,
    objectsPerWave: { min: 2, max: 3 },
    speed: 1.25,
    spawnInterval: 0.72,
    maxActiveEnemies: 4,
    weapon: { cooldown: 0.26, projectiles: 2, spread: 0, depthStep: 1.15 },
    pool: ['ghost_boy', 'king_boo', 'mine'],
  },
  3: {
    duration: 42,
    waves: 18,
    objectsPerWave: { min: 3, max: 4 },
    speed: 1.55,
    spawnInterval: 0.56,
    maxActiveEnemies: 5,
    weapon: { cooldown: 0.2, projectiles: 2, spread: 0, depthStep: 1.25 },
    pool: ['boss', 'chuck', 'mine'],
  },
};

const GamePage = () => {
  const { refreshUser } = useAuth();
  const { data } = useQuery(GET_MISSIONS);
  const missions = data?.getMissions || [];

  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const lives = useGameStore((state) => state.lives);
  const maxCombo = useGameStore((state) => state.maxCombo);
  const waves = useGameStore((state) => state.wavesCompleted);
  const destroyed = useGameStore((state) => state.objectsDestroyed);
  const missionId = useGameStore((state) => state.missionId);
  const startMission = useGameStore((state) => state.startMission);
  const reset = useGameStore((state) => state.reset);

  const previousStatus = useRef(status);
  const previousLives = useRef(lives);
  const [result, setResult] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    if (status !== 'playing') {
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
    if (status === 'playing' && lives < previousLives.current) {
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

  if (status === 'playing') {
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

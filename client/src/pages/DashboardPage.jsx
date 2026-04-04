import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MY_PROGRESS, GET_LEVEL_PROGRESS, GET_ACTIVE_CHALLENGES } from '../graphql/queries.js';
import XPBar from '../components/XPBar.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: progressData } = useQuery(GET_MY_PROGRESS);
  const { data: levelData } = useQuery(GET_LEVEL_PROGRESS);
  const { data: challengeData } = useQuery(GET_ACTIVE_CHALLENGES);

  const progress = progressData?.getMyProgress || [];
  const levelProgress = levelData?.getLevelProgress;
  const challenges = challengeData?.getActiveChallenges || [];

  const renderStars = (count) => {
    return (
      <span className="stars">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= count ? 'star-filled' : 'star-empty'}>★</span>
        ))}
      </span>
    );
  };

  return (
    <div className="dashboard-page page" id="dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fadeIn">
          <div className="welcome-section">
            <span className="welcome-avatar">{user?.avatar}</span>
            <div>
              <h1>Welcome, {user?.username}!</h1>
              <p className="welcome-sub">Ready for another mission, Commander?</p>
            </div>
          </div>
          <Link to="/game" className="btn btn-primary btn-lg" id="dash-play-btn">
            🎮 Play Now
          </Link>
        </div>

        {/* XP Bar */}
        {levelProgress && (
          <div className="dashboard-xp animate-fadeIn">
            <XPBar
              currentXP={levelProgress.currentLevelXP}
              xpForNext={levelProgress.xpForNextLevel}
              level={levelProgress.level}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="stat-grid animate-fadeIn">
          <div className="stat-item">
            <div className="stat-value">{user?.stats?.gamesPlayed || 0}</div>
            <div className="stat-label">Games Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user?.stats?.totalScore || 0}</div>
            <div className="stat-label">Total Score</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user?.stats?.highestCombo || 0}×</div>
            <div className="stat-label">Best Combo</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">💎 {user?.stardust || 0}</div>
            <div className="stat-label">Stardust</div>
          </div>
        </div>

        {/* Mission Progress */}
        <section className="dashboard-section">
          <h2>Mission Progress</h2>
          <div className="mission-progress-grid">
            {[
              { id: 1, name: 'Asteroid Belt', emoji: '🪨', difficulty: 'Easy' },
              { id: 2, name: 'Drone Swarm', emoji: '👾', difficulty: 'Medium' },
              { id: 3, name: 'Meteor Storm', emoji: '☄️', difficulty: 'Hard' },
            ].map((mission) => {
              const mp = progress.find((p) => p.missionId === mission.id);
              return (
                <div className="card mission-card" key={mission.id}>
                  <div className="mission-card-header">
                    <span className="mission-emoji">{mission.emoji}</span>
                    <div>
                      <h3>{mission.name}</h3>
                      <span className={`badge badge-${mission.difficulty.toLowerCase()}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                  </div>
                  {mp ? (
                    <div className="mission-card-stats">
                      <div>Best: <strong>{mp.score}</strong></div>
                      <div>Attempts: {mp.attempts}</div>
                      <div>{renderStars(mp.starsEarned)}</div>
                      {mp.completed && <span className="badge badge-easy">✓ Completed</span>}
                    </div>
                  ) : (
                    <p className="mission-not-played">Not yet attempted</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Challenges */}
        <section className="dashboard-section">
          <h2>Active Challenges</h2>
          {challenges.length === 0 ? (
            <p className="text-muted">No active challenges right now.</p>
          ) : (
            <div className="challenges-list">
              {challenges.map((c) => (
                <div className="card challenge-card" key={c.id}>
                  <div className="challenge-info">
                    <span className={`badge badge-${c.type}`}>{c.type}</span>
                    <h4>{c.title}</h4>
                    <p>{c.description}</p>
                  </div>
                  <div className="challenge-rewards">
                    <span>+{c.xpReward} XP</span>
                    <span>+{c.stardustReward} 💎</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;

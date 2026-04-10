import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MY_PROGRESS, GET_LEVEL_PROGRESS } from '../graphql/queries.js';
import PageShell from '../components/layout/PageShell.jsx';
import XPBar from '../components/XPBar.jsx';
import { MISSION_ORDER, getMissionMeta } from '../constants/missionMeta.js';
import useLiveQuery from '../hooks/useLiveQuery.js';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: progressData } = useLiveQuery(GET_MY_PROGRESS);
  const { data: levelData } = useLiveQuery(GET_LEVEL_PROGRESS);

  const progress = progressData?.getMyProgress || [];
  const levelProgress = levelData?.getLevelProgress;
  const clearedMissions = progress.filter((entry) => entry.completed).length;
  const missionCards = MISSION_ORDER.map((missionId) => {
    const mission = getMissionMeta(missionId);
    return {
      id: mission.id,
      name: mission.name,
      difficulty: mission.difficulty,
      marker: mission.marker,
    };
  });

  return (
    <PageShell
      title="Command Deck"
      subtitle="Track your level and mission performance."
      backTo="/"
      backLabel="Home"
      action={<Link to="/game" className="btn btn-primary btn-lg" id="dash-play-btn">Launch Mission</Link>}
    >
      <div className="dashboard-page page" id="dashboard-page">
        {levelProgress && (
          <div className="dashboard-xp animate-fadeIn">
            <XPBar
              currentXP={levelProgress.currentLevelXP}
              xpForNext={levelProgress.xpForNextLevel}
              level={levelProgress.level}
            />
          </div>
        )}

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
            <div className="stat-value">{user?.stats?.highestCombo || 0}x</div>
            <div className="stat-label">Best Combo</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{clearedMissions}</div>
            <div className="stat-label">Missions Cleared</div>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Mission Progress</h2>
          <div className="mission-progress-grid">
            {missionCards.map((mission) => {
              const missionProgress = progress.find((entry) => entry.missionId === mission.id);

              return (
                <div className="card mission-card" key={mission.id}>
                  <div className="mission-card-header">
                    <span className="mission-emoji">{mission.marker}</span>
                    <div>
                      <h3>{mission.name}</h3>
                      <span className={`badge badge-${mission.difficulty.toLowerCase()}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                  </div>
                  {missionProgress ? (
                    <div className="mission-card-stats">
                      <div>Best: <strong>{missionProgress.score}</strong></div>
                      <div>Attempts: {missionProgress.attempts}</div>
                      {missionProgress.completed && <span className="badge badge-easy">Cleared</span>}
                    </div>
                  ) : (
                    <p className="mission-not-played">Not yet attempted</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default DashboardPage;

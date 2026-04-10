import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_MY_PROGRESS, GET_LEVEL_PROGRESS } from '../graphql/queries.js';
import PageShell from '../components/layout/PageShell.jsx';
import XPBar from '../components/XPBar.jsx';
import PlayerOverviewSections from '../components/player/PlayerOverviewSections.jsx';
import { MISSION_ORDER, getMissionMeta } from '../constants/missionMeta.js';
import { GET_ACHIEVEMENTS } from '../graphql/queries.js';
import useLiveQuery from '../hooks/useLiveQuery.js';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const { data: progressData } = useLiveQuery(GET_MY_PROGRESS);
  const { data: levelData } = useLiveQuery(GET_LEVEL_PROGRESS);
  const { data: achievementsData } = useLiveQuery(GET_ACHIEVEMENTS);

  const progress = progressData?.getMyProgress || [];
  const levelProgress = levelData?.getLevelProgress;
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
      subtitle="Track your commander progress, mission records, and achievements."
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

        <PlayerOverviewSections
          user={user}
          progress={progress}
          achievementsData={achievementsData}
          onRefreshUser={refreshUser}
        />

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

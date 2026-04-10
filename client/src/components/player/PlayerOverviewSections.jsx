import { useMutation } from '@apollo/client';
import { CLAIM_ACHIEVEMENT } from '../../graphql/mutations.js';
import { canClaimAchievement, isSupportedAchievement } from '../../utils/achievementRules.js';
import { ACHIEVEMENT_META } from '../../constants/achievementMeta.js';
import './PlayerOverviewSections.css';

const PlayerOverviewSections = ({
  user,
  progress,
  achievementsData,
  onRefreshUser,
}) => {
  const allAchievements = achievementsData?.getAchievements?.length
    ? achievementsData.getAchievements
    : ACHIEVEMENT_META;
  const visibleAchievements = allAchievements.filter((achievement) => isSupportedAchievement(achievement.key));
  const missionRecords = [...progress]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
  const clearedMissions = progress.filter((entry) => entry.completed).length;
  const unlockedAchievements = user?.achievements?.length || 0;

  const [claimAchievement] = useMutation(CLAIM_ACHIEVEMENT, {
    onCompleted: () => onRefreshUser?.(),
    onError: (error) => alert(error.message),
  });

  return (
    <>
      <section className="player-overview-section">
        <h2>Career Stats</h2>
        <div className="stat-grid player-overview-stats">
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
            <div className="stat-value">{user?.stats?.totalAsteroidsDestroyed || 0}</div>
            <div className="stat-label">Objects Destroyed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{clearedMissions}</div>
            <div className="stat-label">Missions Cleared</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{unlockedAchievements}</div>
            <div className="stat-label">Achievements</div>
          </div>
        </div>
      </section>

      <section className="player-overview-section">
        <h2>Mission Records</h2>
        <div className="player-records-grid">
          {missionRecords.length === 0 ? (
            <div className="card player-record-card muted">No mission runs recorded yet. Launch a mission from the dashboard.</div>
          ) : (
            missionRecords.map((record) => (
              <div className="card player-record-card" key={record.id}>
                <div className="player-record-header">
                  <span className="player-record-mission">Mission {record.missionId}</span>
                  <span className="player-record-score">{record.score}</span>
                </div>
                <div className="player-record-meta">
                  <span>{record.attempts} attempts</span>
                  <span>{record.completed ? 'Completed' : 'In Progress'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="player-overview-section">
        <h2>Achievements</h2>
        <div className="player-achievements-grid">
          {visibleAchievements.map((achievement) => {
            const unlocked = user?.achievements?.includes(achievement.key);
            const claimable = canClaimAchievement({ key: achievement.key, user, progress });

            return (
              <div
                className={`card player-achievement-card ${unlocked ? 'unlocked' : ''} ${claimable ? 'claimable' : ''}`}
                key={achievement.key}
                id={`achievement-${achievement.key}`}
              >
                <span className="player-achievement-icon">{unlocked ? achievement.icon : 'LOCK'}</span>
                <div className="player-achievement-copy">
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                  <span className="player-achievement-reward">+{achievement.xpReward} XP</span>
                </div>
                {claimable ? (
                  <button
                    className="btn btn-sm btn-gold"
                    onClick={() => claimAchievement({ variables: { key: achievement.key } })}
                  >
                    Claim
                  </button>
                ) : null}
                {unlocked ? <span className="badge badge-easy">Unlocked</span> : null}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default PlayerOverviewSections;

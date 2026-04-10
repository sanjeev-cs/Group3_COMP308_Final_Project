import { useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  GET_ACHIEVEMENTS,
  GET_MY_PROGRESS,
  GET_LEVEL_PROGRESS,
} from '../graphql/queries.js';
import { CLAIM_ACHIEVEMENT } from '../graphql/mutations.js';
import PageShell from '../components/layout/PageShell.jsx';
import XPBar from '../components/XPBar.jsx';
import { ACHIEVEMENT_META } from '../constants/achievementMeta.js';
import { canClaimAchievement, isSupportedAchievement } from '../utils/achievementRules.js';
import useLiveQuery from '../hooks/useLiveQuery.js';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { data: achievementsData } = useLiveQuery(GET_ACHIEVEMENTS);
  const { data: progressData } = useLiveQuery(GET_MY_PROGRESS);
  const { data: levelData } = useLiveQuery(GET_LEVEL_PROGRESS);

  const allAchievements = achievementsData?.getAchievements?.length ? achievementsData.getAchievements : ACHIEVEMENT_META;
  const progress = progressData?.getMyProgress || [];
  const levelProgress = levelData?.getLevelProgress;
  const visibleAchievements = allAchievements.filter((achievement) => isSupportedAchievement(achievement.key));
  const unlockedAchievements = user?.achievements?.length || 0;

  const [claimAchievement] = useMutation(CLAIM_ACHIEVEMENT, {
    onCompleted: () => refreshUser(),
    onError: (error) => alert(error.message),
  });

  const missionRecords = [...progress]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return (
    <PageShell
      title="Pilot Dossier"
      subtitle="Your commander profile, mission history, and claimable achievements."
      backTo="/dashboard"
      backLabel="Dashboard"
    >
      <div className="profile-page page" id="profile-page">
        <div className="profile-header card animate-fadeIn">
          <div className="profile-avatar-section">
            <span className="profile-avatar">
              {user?.avatar && user.avatar.endsWith('.svg') ? (
                <img src={`/avatars/${user.avatar}`} alt="avatar" style={{ width: '60px', height: '60px' }} />
              ) : (
                user?.avatar
              )}
            </span>
            <div>
              <h2>{user?.username}</h2>
            </div>
          </div>
          {levelProgress && (
            <div className="profile-xp">
              <XPBar
                currentXP={levelProgress.currentLevelXP}
                xpForNext={levelProgress.xpForNextLevel}
                level={levelProgress.level}
              />
            </div>
          )}
        </div>

        <section className="profile-section">
          <h2>Career Stats</h2>
          <div className="stat-grid">
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
              <div className="stat-value">{unlockedAchievements}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Lv.{user?.level || 1}</div>
              <div className="stat-label">Level</div>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2>Mission Records</h2>
          <div className="records-grid">
            {missionRecords.length === 0 ? (
              <div className="card record-card muted">No mission runs recorded yet. Launch a mission from the dashboard.</div>
            ) : (
              missionRecords.map((record) => (
                <div className="card record-card" key={record.id}>
                  <div className="record-header">
                    <span className="record-mission">Mission {record.missionId}</span>
                    <span className="record-score">{record.score}</span>
                  </div>
                  <div className="record-meta">
                    <span>{record.attempts} attempts</span>
                    <span>{record.completed ? 'Completed' : 'In Progress'}</span>
                    <span>{record.starsEarned}/3 stars</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            {visibleAchievements.map((achievement) => {
              const unlocked = user?.achievements?.includes(achievement.key);
              const claimable = canClaimAchievement({ key: achievement.key, user, progress });

              return (
                <div
                  className={`card achievement-card ${unlocked ? 'unlocked' : ''} ${claimable ? 'claimable' : ''}`}
                  key={achievement.key}
                  id={`achievement-${achievement.key}`}
                >
                  <span className="achievement-icon">{unlocked ? achievement.icon : 'LOCK'}</span>
                  <div>
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    <span className="achievement-reward">+{achievement.xpReward} XP</span>
                  </div>
                  {claimable && (
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => claimAchievement({ variables: { key: achievement.key } })}
                    >
                      Claim
                    </button>
                  )}
                  {unlocked && <span className="badge badge-easy">Unlocked</span>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default ProfilePage;

import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  GET_ACHIEVEMENTS,
  GET_MY_PROGRESS,
  GET_LEVEL_PROGRESS,
} from '../graphql/queries.js';
import { PURCHASE_POWER_UP, CLAIM_ACHIEVEMENT } from '../graphql/mutations.js';
import XPBar from '../components/XPBar.jsx';
import './ProfilePage.css';

const POWER_UPS = [
  { id: 'auto_turret', name: 'Auto-Turret', description: 'Auto-destroys 3 asteroids per mission', cost: 100, icon: '🔫' },
  { id: 'time_warp', name: 'Time Warp', description: 'Slows all objects for 5 seconds', cost: 150, icon: '⏳' },
  { id: 'force_shield', name: 'Force Shield', description: 'Blocks 1 missed asteroid', cost: 200, icon: '🛡️' },
];

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { data: achievementsData } = useQuery(GET_ACHIEVEMENTS);
  const { data: progressData } = useQuery(GET_MY_PROGRESS);
  const { data: levelData } = useQuery(GET_LEVEL_PROGRESS);

  const allAchievements = achievementsData?.getAchievements || [];
  const progress = progressData?.getMyProgress || [];
  const levelProgress = levelData?.getLevelProgress;

  const [purchasePowerUp] = useMutation(PURCHASE_POWER_UP, {
    onCompleted: () => refreshUser(),
    onError: (err) => alert(err.message),
  });

  const [claimAchievement] = useMutation(CLAIM_ACHIEVEMENT, {
    onCompleted: () => refreshUser(),
    onError: (err) => alert(err.message),
  });

  // Determine which achievements the user can claim
  const canClaim = (key) => {
    if (user.achievements.includes(key)) return false;
    const stats = user.stats;
    switch (key) {
      case 'first_contact': return progress.some((p) => p.completed);
      case 'combo_master': return stats.highestCombo >= 10;
      case 'star_commander': {
        const completedIds = progress.filter((p) => p.completed).map((p) => p.missionId);
        return [1, 2, 3].every((id) => completedIds.includes(id));
      }
      case 'stardust_collector': return user.stardust >= 500;
      default: return false;
    }
  };

  return (
    <div className="profile-page page" id="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header card animate-fadeIn">
          <div className="profile-avatar-section">
            <span className="profile-avatar">{user?.avatar}</span>
            <div>
              <h1>{user?.username}</h1>
              <p className="profile-email">{user?.email}</p>
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

        {/* Stats */}
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
              <div className="stat-value">{user?.stats?.highestCombo || 0}×</div>
              <div className="stat-label">Best Combo</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{user?.stats?.totalAsteroidsDestroyed || 0}</div>
              <div className="stat-label">Objects Destroyed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">💎 {user?.stardust || 0}</div>
              <div className="stat-label">Stardust</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Lv.{user?.level || 1}</div>
              <div className="stat-label">Level</div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="profile-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            {allAchievements.map((a) => {
              const unlocked = user?.achievements?.includes(a.key);
              const claimable = !unlocked && canClaim(a.key);
              return (
                <div
                  className={`card achievement-card ${unlocked ? 'unlocked' : ''} ${claimable ? 'claimable' : ''}`}
                  key={a.key}
                  id={`achievement-${a.key}`}
                >
                  <span className="achievement-icon">{unlocked ? a.icon : '🔒'}</span>
                  <div>
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                    <span className="achievement-reward">+{a.xpReward} XP • +{a.stardustReward} 💎</span>
                  </div>
                  {claimable && (
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => claimAchievement({ variables: { key: a.key } })}
                    >
                      Claim
                    </button>
                  )}
                  {unlocked && <span className="badge badge-easy">✓</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Power-ups Shop */}
        <section className="profile-section">
          <h2>Power-up Shop</h2>
          <div className="powerups-grid">
            {POWER_UPS.map((p) => {
              const owned = user?.unlockedPowerUps?.includes(p.id);
              const canAfford = (user?.stardust || 0) >= p.cost;
              return (
                <div className={`card powerup-card ${owned ? 'owned' : ''}`} key={p.id} id={`powerup-${p.id}`}>
                  <span className="powerup-icon">{p.icon}</span>
                  <h4>{p.name}</h4>
                  <p>{p.description}</p>
                  {owned ? (
                    <span className="badge badge-easy">✓ Owned</span>
                  ) : (
                    <button
                      className="btn btn-sm btn-gold"
                      disabled={!canAfford}
                      onClick={() => purchasePowerUp({ variables: { powerUpId: p.id } })}
                    >
                      💎 {p.cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;

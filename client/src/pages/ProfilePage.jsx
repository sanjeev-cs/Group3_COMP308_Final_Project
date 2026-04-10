import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import { UPDATE_PROFILE } from '../graphql/mutations.js';
import PageShell from '../components/layout/PageShell.jsx';
import XPBar from '../components/XPBar.jsx';
import { AVATAR_OPTIONS } from '../constants/avatarOptions.js';
import { isValidPassword, PASSWORD_RULE_TEXT } from '../utils/passwordPolicy.js';
import useLiveQuery from '../hooks/useLiveQuery.js';
import { GET_LEVEL_PROGRESS } from '../graphql/queries.js';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { data: levelData } = useLiveQuery(GET_LEVEL_PROGRESS);
  const levelProgress = levelData?.getLevelProgress;
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const avatarChanged = useMemo(
    () => selectedAvatar !== (user?.avatar || AVATAR_OPTIONS[0]),
    [selectedAvatar, user?.avatar],
  );

  useEffect(() => {
    setSelectedAvatar(user?.avatar || AVATAR_OPTIONS[0]);
  }, [user?.avatar]);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE, {
    onCompleted: async () => {
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setFeedback('Profile updated.');
    },
    onError: (mutationError) => {
      setFeedback('');
      setError(mutationError.message);
    },
  });

  const saveAvatar = () => {
    setFeedback('');
    setError('');
    updateProfile({ variables: { input: { avatar: selectedAvatar } } });
  };

  const savePassword = () => {
    setFeedback('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill in all password fields.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(PASSWORD_RULE_TEXT);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    updateProfile({
      variables: {
        input: {
          currentPassword,
          newPassword,
        },
      },
    });
  };

  return (
    <PageShell
      title="Pilot Settings"
      subtitle="View your commander identity, change your avatar, and update your password."
      backTo="/dashboard"
      backLabel="Dashboard"
    >
      <div className="profile-page page" id="profile-page">
        <div className="profile-layout">
          <section className="card profile-summary-card">
            <div className="profile-summary-head">
              <span className="profile-avatar-frame">
                <img src={`/avatars/${selectedAvatar}`} alt="selected avatar" className="profile-avatar-image" />
              </span>
              <div className="profile-summary-copy">
                <span className="profile-kicker">Commander</span>
                <h2>{user?.username}</h2>
                <p>Account settings for your active pilot.</p>
              </div>
            </div>
            <div className="profile-summary-meta">
              <div className="profile-summary-chip">
                <span className="profile-summary-label">Username</span>
                <strong>{user?.username}</strong>
              </div>
              <div className="profile-summary-chip">
                <span className="profile-summary-label">Level</span>
                <strong>Lv {user?.level || 1}</strong>
              </div>
            </div>
            {levelProgress ? (
              <div className="profile-summary-xp">
                <XPBar
                  currentXP={levelProgress.currentLevelXP}
                  xpForNext={levelProgress.xpForNextLevel}
                  level={levelProgress.level}
                />
              </div>
            ) : null}
          </section>

          <section className="card profile-settings-card">
            <div className="profile-settings-grid">
              <div className="profile-settings-block">
                <h2>Avatar</h2>
                <p className="profile-section-copy">Choose the pilot badge shown in the navbar and profile.</p>
                <div className="avatar-option-grid">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      className={`avatar-option ${selectedAvatar === avatar ? 'avatar-option-active' : ''}`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <img src={`/avatars/${avatar}`} alt={avatar} className="avatar-option-image" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!avatarChanged || loading}
                  onClick={saveAvatar}
                >
                  Save Avatar
                </button>
              </div>

              <div className="profile-settings-block">
                <h2>Password</h2>
                <p className="profile-section-copy">{PASSWORD_RULE_TEXT}</p>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-current-password">Current Password</label>
                  <input
                    id="profile-current-password"
                    className="form-input"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-new-password">New Password</label>
                  <input
                    id="profile-new-password"
                    className="form-input"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-confirm-password">Confirm New Password</label>
                  <input
                    id="profile-confirm-password"
                    className="form-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading}
                  onClick={savePassword}
                >
                  Update Password
                </button>
              </div>
            </div>

            {feedback ? <div className="profile-feedback success">{feedback}</div> : null}
            {error ? <div className="profile-feedback error">{error}</div> : null}
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;

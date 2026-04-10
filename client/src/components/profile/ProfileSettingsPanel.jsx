import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { UPDATE_PROFILE } from '../../graphql/mutations.js';
import { AVATAR_OPTIONS } from '../../constants/avatarOptions.js';
import { isValidPassword, PASSWORD_RULE_TEXT } from '../../utils/passwordPolicy.js';
import './ProfileSettingsPanel.css';

const ProfileSettingsPanel = ({ compact = false, onClose = null }) => {
  const { user, refreshUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const getMutationErrorMessage = (mutationError) => {
    const graphQLErrorMessage = mutationError.graphQLErrors?.[0]?.message;
    const networkGraphQLErrorMessage = mutationError.networkError?.result?.errors?.[0]?.message;

    if (graphQLErrorMessage) return graphQLErrorMessage;
    if (networkGraphQLErrorMessage) return networkGraphQLErrorMessage;
    if (mutationError.message === 'Response not successful: Received status code 400') {
      return 'The server rejected this profile update. If you are using the deployed backend, redeploy it so it includes the latest updateProfile mutation.';
    }

    return mutationError.message;
  };

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
      setError(getMutationErrorMessage(mutationError));
    },
  });

  const saveProfile = () => {
    setFeedback('');
    setError('');

    const input = {};

    if (avatarChanged) {
      input.avatar = selectedAvatar;
    }

    if (currentPassword || newPassword || confirmPassword) {
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

      input.currentPassword = currentPassword;
      input.newPassword = newPassword;
    }

    if (Object.keys(input).length === 0) {
      setError('Make a change before updating your profile.');
      return;
    }

    updateProfile({
      variables: {
        input,
      },
    });
  };

  return (
    <div className={`profile-settings-panel ${compact ? 'profile-settings-panel-compact' : ''}`}>
      <div className="profile-settings-summary">
        <div className="profile-settings-identity">
          <span className="profile-settings-avatar-frame">
            <img src={`/avatars/${selectedAvatar}`} alt="selected avatar" className="profile-settings-avatar-image" />
          </span>
          <div className="profile-settings-name-row">
            <span className="profile-settings-username">{user?.username}</span>
            <span className="profile-settings-level">Level {user?.level || 1}</span>
          </div>
        </div>
        {onClose ? (
          <button type="button" className="profile-settings-close" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>

      <div className="profile-settings-grid">
        <div className="profile-settings-block">
          <h2>Avatar</h2>
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
        </div>

        <div className="profile-settings-block">
          <h2>Password</h2>
          <p className="profile-section-copy">{PASSWORD_RULE_TEXT}</p>
          <div className="form-group">
            <label className="form-label" htmlFor={compact ? 'modal-current-password' : 'profile-current-password'}>Current Password</label>
            <div className="password-field">
              <input
                id={compact ? 'modal-current-password' : 'profile-current-password'}
                className="form-input password-input"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword((value) => !value)}
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={compact ? 'modal-new-password' : 'profile-new-password'}>New Password</label>
            <div className="password-field">
              <input
                id={compact ? 'modal-new-password' : 'profile-new-password'}
                className="form-input password-input"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword((value) => !value)}
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={compact ? 'modal-confirm-password' : 'profile-confirm-password'}>Confirm New Password</label>
            <div className="password-field">
              <input
                id={compact ? 'modal-confirm-password' : 'profile-confirm-password'}
                className="form-input password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-settings-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={saveProfile}
        >
          Update Profile
        </button>
      </div>

      {feedback ? <div className="profile-feedback success">{feedback}</div> : null}
      {error ? <div className="profile-feedback error">{error}</div> : null}
    </div>
  );
};

export default ProfileSettingsPanel;

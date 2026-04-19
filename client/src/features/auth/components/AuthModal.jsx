import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN, REGISTER } from '../../../graphql/mutations.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidPassword, PASSWORD_RULE_TEXT } from '../utils/passwordPolicy.js';
import './AuthModal.css';

const AVATAR_OPTIONS = ['batman.svg', 'boy.svg', 'sloth.svg'];

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="password-toggle-icon">
    <path
      d="M2 12c2.3-4 5.8-6 10-6s7.7 2 10 6c-2.3 4-5.8 6-10 6s-7.7-2-10-6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    {!open && (
      <path
        d="M4 20 20 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const AuthModal = ({ mode = 'login', onModeChange, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginValues, setLoginValues] = useState({ username: '', password: '' });
  const [registerValues, setRegisterValues] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    avatar: 'batman.svg',
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.token, data.login.user);
      onClose?.();
      navigate('/dashboard');
    },
    onError: (err) => {
      setLoginError(err.message);
    },
  });

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      login(data.register.token, data.register.user);
      onClose?.();
      navigate('/dashboard');
    },
    onError: (err) => {
      setRegisterError(err.message);
    },
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError('');

    if (!loginValues.username || !loginValues.password) {
      setLoginError('Please fill in all fields');
      return;
    }

    loginMutation({
      variables: {
        username: loginValues.username.trim(),
        password: loginValues.password,
      },
    });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setRegisterError('');

    if (!registerValues.username || !registerValues.password || !registerValues.confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    if (!isValidPassword(registerValues.password)) {
      setRegisterError(PASSWORD_RULE_TEXT);
      return;
    }
    if (registerValues.password !== registerValues.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    registerMutation({
      variables: {
        input: {
          username: registerValues.username.trim(),
          password: registerValues.password,
          avatar: registerValues.avatar,
        },
      },
    });
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div
        className="auth-modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close auth popup">
          x
        </button>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => onModeChange?.('login')}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-modal-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => onModeChange?.('register')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <div className="auth-modal-panel">
            <div className="auth-modal-header">
              <span className="auth-modal-kicker">Pilot Access</span>
              <h2 id="auth-modal-title">Log back into Stellar Smash</h2>
              <p>Use your username and password to rejoin the run.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-modal-form">
              {loginError && <div className="auth-modal-error">{loginError}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="modal-login-username">Username</label>
                <input
                  id="modal-login-username"
                  type="text"
                  className="form-input"
                  placeholder="SpaceCommander"
                  value={loginValues.username}
                  onChange={(event) => setLoginValues((current) => ({ ...current, username: event.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-login-password">Password</label>
                <div className="password-field">
                  <input
                    id="modal-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input password-field-input"
                    placeholder="********"
                    value={loginValues.password}
                    onChange={(event) => setLoginValues((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowLoginPassword((current) => !current)}
                  >
                    <EyeIcon open={showLoginPassword} />
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-modal-submit" disabled={loginLoading}>
                {loginLoading ? 'Signing In...' : 'Enter Tunnel'}
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-modal-panel">
            <div className="auth-modal-header">
              <span className="auth-modal-kicker">New Pilot</span>
              <h2 id="auth-modal-title">Create your account</h2>
              <p>Pick a username, lock the password down, and launch in.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="auth-modal-form">
              {registerError && <div className="auth-modal-error">{registerError}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="modal-register-username">Username</label>
                <input
                  id="modal-register-username"
                  type="text"
                  className="form-input"
                  placeholder="SpaceCommander"
                  value={registerValues.username}
                  onChange={(event) => setRegisterValues((current) => ({ ...current, username: event.target.value }))}
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-register-password">Password</label>
                <div className="password-field">
                  <input
                    id="modal-register-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    className="form-input password-field-input"
                    placeholder="********"
                    value={registerValues.password}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, password: event.target.value }))}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowRegisterPassword((current) => !current)}
                  >
                    <EyeIcon open={showRegisterPassword} />
                  </button>
                </div>
                <p className="auth-modal-helper">{PASSWORD_RULE_TEXT}</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-register-confirm">Confirm Password</label>
                <div className="password-field">
                  <input
                    id="modal-register-confirm"
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    className="form-input password-field-input"
                    placeholder="********"
                    value={registerValues.confirmPassword}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowRegisterConfirmPassword((current) => !current)}
                  >
                    <EyeIcon open={showRegisterConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Avatar</label>
                <div className="auth-modal-avatar-picker">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      className={`auth-modal-avatar ${registerValues.avatar === avatar ? 'selected' : ''}`}
                      onClick={() => setRegisterValues((current) => ({ ...current, avatar }))}
                    >
                      <img src={`/avatars/${avatar}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-modal-submit" disabled={registerLoading}>
                {registerLoading ? 'Creating Account...' : 'Launch Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

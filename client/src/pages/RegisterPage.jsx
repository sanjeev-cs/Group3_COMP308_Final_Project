import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../graphql/mutations.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './AuthPages.css';

const AVATAR_OPTIONS = ['🚀', '👨‍🚀', '👩‍🚀', '🛸', '🌟', '🪐', '🤖', '👾'];

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [registerMutation, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      login(data.register.token, data.register.user);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    registerMutation({
      variables: { input: { username, email, password, avatar } },
    });
  };

  return (
    <div className="auth-page page" id="register-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <span className="auth-icon">👨‍🚀</span>
            <h1>Create Account</h1>
            <p>Join the Stellar Smash fleet</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            {error && <div className="form-error auth-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                className="form-input"
                placeholder="SpaceCommander"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={20}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="commander@space.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Choose Avatar</label>
              <div className="avatar-picker" id="avatar-picker">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`avatar-option ${avatar === opt ? 'selected' : ''}`}
                    onClick={() => setAvatar(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Launch Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

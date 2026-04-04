import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.token, data.login.user);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    loginMutation({ variables: { email, password } });
  };

  return (
    <div className="auth-page page" id="login-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <span className="auth-icon">🚀</span>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your mission</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            {error && <div className="form-error auth-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="commander@space.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

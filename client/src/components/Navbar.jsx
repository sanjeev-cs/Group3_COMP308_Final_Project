import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useGameplayState from '../state/useGameplayState.js';
import ProfileQuickModal from './profile/ProfileQuickModal.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const gameStatus = useGameplayState((state) => state.status);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  if (location.pathname === '/game' && ['playing', 'paused'].includes(gameStatus)) {
    return null;
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-dot" />
          <span className="brand-text">Stellar Smash</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/game" className="nav-link">Play</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <div className="nav-user-info">
                <button type="button" className="nav-account-shell" onClick={() => setIsProfileOpen(true)}>
                  <span className="nav-level">Level {user.level}</span>
                  <span className="nav-avatar">
                    {user.avatar && user.avatar.endsWith('.svg') ? (
                      <img src={`/avatars/${user.avatar}`} alt="avatar" className="nav-avatar-image" />
                    ) : (
                      user.avatar
                    )}
                  </span>
                </button>
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm btn-secondary nav-logout-btn" id="logout-btn">
                  Log out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <ProfileQuickModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </nav>
  );
};

export default Navbar;

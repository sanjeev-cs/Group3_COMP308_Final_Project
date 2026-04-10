import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/game') {
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
              <Link to="/profile" className="nav-link">Profile</Link>
              <div className="nav-user-info">
                <div className="nav-account-shell">
                  <span className="nav-level">Level {user.level}</span>
                  <Link to="/profile" className="nav-identity">
                    <span className="nav-avatar">
                      {user.avatar && user.avatar.endsWith('.svg') ? (
                        <img src={`/avatars/${user.avatar}`} alt="avatar" className="nav-avatar-image" />
                      ) : (
                        user.avatar
                      )}
                    </span>
                    <span className="nav-identity-copy">
                      <span className="nav-identity-name">{user.username}</span>
                      <span className="nav-identity-sub">Pilot Profile</span>
                    </span>
                  </Link>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm btn-secondary nav-logout-btn" id="logout-btn">
                  Log out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

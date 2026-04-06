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
                <span className="nav-stardust">{user.stardust} dust</span>
                <span className="nav-level">Lv {user.level}</span>
                <span className="nav-avatar">{user.avatar}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm btn-secondary" id="logout-btn">
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary" id="login-nav-btn">Log in</Link>
              <Link to="/register" className="btn btn-sm btn-primary" id="register-nav-btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

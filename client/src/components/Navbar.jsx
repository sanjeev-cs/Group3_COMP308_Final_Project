import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚀</span>
          <span className="brand-text">Stellar Smash</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/game" className="nav-link">Play</Link>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <div className="nav-user-info">
                <span className="nav-stardust">💎 {user.stardust}</span>
                <span className="nav-level">Lv.{user.level}</span>
                <span className="nav-avatar">{user.avatar}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary" id="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary" id="login-nav-btn">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary" id="register-nav-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page" id="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="star star-1" />
          <div className="star star-2" />
          <div className="star star-3" />
          <div className="star star-4" />
          <div className="star star-5" />
        </div>

        <div className="hero-content container">
          <h1 className="hero-title">
            <span className="hero-icon">🚀</span>
            <span className="title-line">Stellar</span>
            <span className="title-line accent">Smash</span>
          </h1>
          <p className="hero-subtitle">
            Defend your space station from asteroids, alien drones, and cosmic debris.
            Click fast. Score big. Climb the leaderboard.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/game" className="btn btn-primary btn-lg" id="play-now-btn">
                  🎮 Play Now
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg" id="dashboard-btn">
                  📊 Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="get-started-btn">
                  🚀 Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="sign-in-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon">🎯</div>
            <h3>Click & Destroy</h3>
            <p>Asteroids and drones fly at your station. Click them before they hit!</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">⚡</div>
            <h3>Build Combos</h3>
            <p>Chain consecutive hits for a score multiplier. Speed and accuracy matter!</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">🏆</div>
            <h3>Climb the Ranks</h3>
            <p>Earn XP, level up, unlock power-ups, and compete on the global leaderboard.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">💎</div>
            <h3>Earn Rewards</h3>
            <p>Collect Stardust, unlock achievements, and complete daily challenges.</p>
          </div>
        </div>
      </section>

      {/* Missions Preview */}
      <section className="missions-preview container">
        <h2 className="section-title">Missions</h2>
        <div className="missions-grid">
          <div className="mission-preview card">
            <span className="badge badge-easy">Easy</span>
            <h3>🪨 Asteroid Belt</h3>
            <p>Navigate through a dense asteroid field. A perfect starting point.</p>
          </div>
          <div className="mission-preview card">
            <span className="badge badge-medium">Medium</span>
            <h3>👾 Drone Swarm</h3>
            <p>Alien drones zigzag unpredictably. Can you keep up?</p>
          </div>
          <div className="mission-preview card">
            <span className="badge badge-hard">Hard</span>
            <h3>☄️ Meteor Storm</h3>
            <p>A massive storm of meteors. Only the quickest survive.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>Stellar Smash © 2025 — Built with React, Three.js & GraphQL</p>
      </footer>
    </div>
  );
};

export default HomePage;

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page" id="home-page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">Fly fast. Hit hard. Don't die.</h1>
          <p className="hero-subtitle">
            A 3D space game where you pilot a ship through waves of asteroids,
            drones and mines. Steer with your mouse, hold to shoot, survive as
            long as you can.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/game" className="btn btn-primary btn-lg" id="play-now-btn">Play now</Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg" id="dashboard-btn">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="get-started-btn">Create account</Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="sign-in-btn">Log in</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="features-section container">
        <h2>What you're getting into</h2>
        <p className="features-lead">Three minutes per round. Infinite replay value.</p>
        <div className="features-list">
          <div className="feature-cell">
            <div className="feature-num">01</div>
            <h3>Hyper-Tunnel flight</h3>
            <p>Navigate a massive tubular structure at high speed. Move the mouse to steer your ship along the inner wall. Hold click to shoot energy bolts.</p>
          </div>
          <div className="feature-cell">
            <div className="feature-num">02</div>
            <h3>Combo multiplier</h3>
            <p>Every consecutive hit raises your multiplier. Miss once and it's gone. Risk versus reward, every second.</p>
          </div>
          <div className="feature-cell">
            <div className="feature-num">03</div>
            <h3>Progress and rank</h3>
            <p>XP, levels, stardust currency, achievements and a live leaderboard. Your scores persist across sessions.</p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="missions-section container">
        <h2>Missions</h2>
        {[
          { diff: 'easy',   name: 'The Minefield',  desc: 'Classic survival. Learn to dodge massive meteors and mines.' },
          { diff: 'medium', name: 'Alien Swarm',    desc: 'Faster enemies including Buster Drones and Alien Metroids.' },
          { diff: 'hard',   name: 'The Absurd Threat', desc: 'Maximum speed! Survive the Boss and Angry Bird.' },
        ].map(m => (
          <div key={m.name} className="mission-row">
            <span className={`mission-diff ${m.diff}`} />
            <span className="mission-name">{m.name}</span>
            <span className="mission-desc">{m.desc}</span>
          </div>
        ))}
      </section>

      <footer className="home-footer">
        Stellar Smash · COMP308 Group 3 · React + Three.js + GraphQL
      </footer>
    </div>
  );
};

export default HomePage;

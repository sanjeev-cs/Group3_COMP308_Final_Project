import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from '../features/auth/components/AuthModal.jsx';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import { MISSION_ORDER, getMissionMeta } from '../features/game/constants/missionMeta.js';
import UiSceneBackground from '../shared/components/layout/UiSceneBackground.jsx';
import './HomePage.css';

const HomePage = ({ authMode = null }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeMode = authMode || (location.pathname === '/login' ? 'login' : location.pathname === '/register' ? 'register' : null);
  const missionPreview = MISSION_ORDER.map((missionId) => {
    const mission = getMissionMeta(missionId);
    return {
      diff: mission.difficulty.toLowerCase(),
      name: mission.name,
      desc: mission.previewDesc,
    };
  });

  useEffect(() => {
    if (user && routeMode) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, routeMode, user]);

  const closeAuthModal = () => {
    navigate('/', { replace: true });
  };

  const switchAuthMode = (nextMode) => {
    navigate(nextMode === 'register' ? '/register' : '/login', { replace: true });
  };

  return (
    <div className="home-page" id="home-page">
      <div className="home-scene">
        <UiSceneBackground />
      </div>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">
            <span>Fly fast.</span>
            <span>Survive longer.</span>
          </h1>
          <p className="hero-subtitle">
            A 3D space survival run where you steer with the mouse, fire toward
            your cursor, and weave through asteroids, mines, and spectral
            threats inside a collapsing tunnel.
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

          <div className="hero-summary card">
            <div className="hero-summary-strip">
              <div className="summary-chip">
                <span className="summary-label">Aim</span>
                <strong>Mouse steer + click to fire</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Mode</span>
                <strong>60 second survival runs</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Goal</span>
                <strong>Build combo and stay alive</strong>
              </div>
            </div>

            <div className="mission-preview">
              {missionPreview.map((mission) => (
                <div key={mission.name} className={`mission-preview-card ${mission.diff}`}>
                  <div className="mission-preview-top">
                    <span className={`mission-diff ${mission.diff}`} />
                    <span className="mission-preview-tier">{mission.diff}</span>
                  </div>
                  <h2>{mission.name}</h2>
                  <p>{mission.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!user && routeMode && (
        <AuthModal mode={routeMode} onModeChange={switchAuthMode} onClose={closeAuthModal} />
      )}
    </div>
  );
};

export default HomePage;

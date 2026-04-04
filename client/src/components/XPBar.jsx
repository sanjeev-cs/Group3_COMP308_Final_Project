import './XPBar.css';

const XPBar = ({ currentXP, xpForNext, level }) => {
  const progress = xpForNext > 0 ? Math.min((currentXP / xpForNext) * 100, 100) : 100;

  return (
    <div className="xp-bar-container" id="xp-bar">
      <div className="xp-bar-header">
        <span className="xp-level">Level {level}</span>
        <span className="xp-text">{currentXP} / {xpForNext} XP</span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;

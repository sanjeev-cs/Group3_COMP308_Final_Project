import { useState, useEffect } from 'react';
import './AchievementPopup.css';

const AchievementPopup = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`achievement-popup ${visible ? 'show' : 'hide'}`} id="achievement-popup">
      <div className="achievement-popup-icon">{achievement.icon}</div>
      <div className="achievement-popup-content">
        <div className="achievement-popup-title">Achievement Unlocked!</div>
        <div className="achievement-popup-name">{achievement.name}</div>
        <div className="achievement-popup-rewards">+{achievement.xpReward} XP</div>
      </div>
    </div>
  );
};

export default AchievementPopup;

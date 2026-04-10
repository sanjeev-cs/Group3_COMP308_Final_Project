import { useEffect } from 'react';
import ProfileSettingsPanel from './ProfileSettingsPanel.jsx';
import './ProfileQuickModal.css';

const ProfileQuickModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="profile-quick-modal-backdrop" onClick={onClose}>
      <div className="profile-quick-modal" onClick={(event) => event.stopPropagation()}>
        <ProfileSettingsPanel compact onClose={onClose} />
      </div>
    </div>
  );
};

export default ProfileQuickModal;

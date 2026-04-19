import ProfileSettingsPanel from '../features/profile/components/ProfileSettingsPanel.jsx';
import PageShell from '../shared/components/layout/PageShell.jsx';
import './ProfilePage.css';

const ProfilePage = () => (
  <PageShell
    title="Pilot Settings"
    subtitle="Manage your account, avatar, and password."
    backTo="/dashboard"
    backLabel="Dashboard"
  >
    <div className="profile-page page" id="profile-page">
      <div className="profile-layout">
        <section className="card profile-settings-shell">
          <ProfileSettingsPanel />
        </section>
      </div>
    </div>
  </PageShell>
);

export default ProfilePage;

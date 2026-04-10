import PageShell from '../components/layout/PageShell.jsx';
import ProfileSettingsPanel from '../components/profile/ProfileSettingsPanel.jsx';
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

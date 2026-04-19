import { useAuth } from '../features/auth/context/AuthContext.jsx';
import LeaderboardTable from '../features/leaderboard/components/LeaderboardTable.jsx';
import { GET_LEADERBOARD } from '../graphql/queries.js';
import PageShell from '../shared/components/layout/PageShell.jsx';
import useLiveQuery from '../shared/hooks/useLiveQuery.js';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const { data, loading } = useLiveQuery(GET_LEADERBOARD, {
    variables: { limit: 20 },
  });

  const entries = data?.getLeaderboard || [];

  return (
    <PageShell
      title="Leaderboard"
      subtitle="Top commanders ranked by overall score across the whole game."
      backTo="/dashboard"
      backLabel="Dashboard"
    >
      <div className="leaderboard-page page" id="leaderboard-page">
        <div className="card leaderboard-card">
          {loading && entries.length === 0 ? (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          ) : (
            <LeaderboardTable entries={entries} currentUserId={user?.id} />
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default LeaderboardPage;

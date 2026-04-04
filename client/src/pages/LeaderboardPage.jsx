import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext.jsx';
import { GET_LEADERBOARD } from '../graphql/queries.js';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [selectedMission, setSelectedMission] = useState(null);

  const { data, loading } = useQuery(GET_LEADERBOARD, {
    variables: { missionId: selectedMission, limit: 20 },
  });

  const entries = data?.getLeaderboard || [];

  return (
    <div className="leaderboard-page page" id="leaderboard-page">
      <div className="container">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">Top commanders across the galaxy</p>

        {/* Mission Filter Tabs */}
        <div className="leaderboard-filters" id="leaderboard-filters">
          <button
            className={`filter-btn ${selectedMission === null ? 'active' : ''}`}
            onClick={() => setSelectedMission(null)}
          >
            All Missions
          </button>
          <button
            className={`filter-btn ${selectedMission === 1 ? 'active' : ''}`}
            onClick={() => setSelectedMission(1)}
          >
            🪨 Asteroid Belt
          </button>
          <button
            className={`filter-btn ${selectedMission === 2 ? 'active' : ''}`}
            onClick={() => setSelectedMission(2)}
          >
            👾 Drone Swarm
          </button>
          <button
            className={`filter-btn ${selectedMission === 3 ? 'active' : ''}`}
            onClick={() => setSelectedMission(3)}
          >
            ☄️ Meteor Storm
          </button>
        </div>

        {/* Leaderboard */}
        <div className="card leaderboard-card">
          {loading ? (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          ) : (
            <LeaderboardTable entries={entries} currentUserId={user?.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

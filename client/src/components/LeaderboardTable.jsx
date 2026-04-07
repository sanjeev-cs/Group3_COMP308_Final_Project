import './LeaderboardTable.css';

const LeaderboardTable = ({ entries, currentUserId }) => {
  if (!entries || entries.length === 0) {
    return <p className="text-muted">No scores recorded yet. Be the first!</p>;
  }

  return (
    <div className="leaderboard-table-wrapper" id="leaderboard-table">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Overall Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return (
              <tr
                key={entry.id}
                className={isCurrentUser ? 'current-user-row' : ''}
              >
                <td className="rank-cell">
                  <span className="rank-number">{rankEmoji || `#${index + 1}`}</span>
                </td>
                <td className="player-cell">
                  <span className="player-avatar">{entry.avatar}</span>
                  <span className="player-name">{entry.username}</span>
                </td>
                <td className="score-cell">{entry.score.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;

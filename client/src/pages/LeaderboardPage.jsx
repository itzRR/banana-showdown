// ============================================================
//  LeaderboardPage — Top 5 match results
//  Fetches from GET /api/leaderboard
// ============================================================

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(res => setEntries(res.data))
      .catch(() => setError('Could not load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  const rankEmoji = (i) => ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `#${i + 1}`;
  const rankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

  const actionLabel = (a) => ({
    attack: '⚔️ Attack',
    randomSkill: '🎲 Random Skill',
    bananaPower: '🍌 Banana Power'
  })[a] || a;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🏆 Leaderboard</h1>
          <p>Top 10 highest-scoring battles in Banana Showdown</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/game')} id="go-battle-btn">
          ⚔️ Battle Now
        </button>
      </div>

      <div className="card">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading scores…</p>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && entries.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🍌</span>
            <p>No battles yet! Be the first to enter the arena.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/select')}>
              Play Now
            </button>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <table className="leaderboard-table" id="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Character</th>
                <th>Move Used</th>
                <th>Score</th>
                <th>Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry.id} id={`lb-row-${i}`}>
                  <td>
                    <span className={`leaderboard-rank ${rankClass(i)}`}>
                      {rankEmoji(i)}
                    </span>
                  </td>
                  <td><span className="lb-username">{entry.username}</span></td>
                  <td>{entry.character}</td>
                  <td>{actionLabel(entry.action)}</td>
                  <td><span className="lb-score">{entry.score}</span></td>
                  <td>
                    <span className={`lb-badge ${entry.result}`}>
                      {entry.result === 'win' ? '✓ Win' : '✗ Loss'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(entry.playedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;

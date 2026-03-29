import { useNavigate, useLocation } from 'react-router-dom';

interface ResultsState {
  score: number;
  stars: number;
  accuracy: number;
  bestCombo: number;
  levelId: number;
}

export function GameOver() {
  const navigate = useNavigate();
  const location = useLocation();
  const results = (location.state as ResultsState) || { score: 0, stars: 0, accuracy: 0, bestCombo: 0, levelId: 1 };

  const starDisplay = [1, 2, 3].map(i => results.stars >= i ? '\u2605' : '\u2606').join('');

  return (
    <div className="results-screen">
      <h1 className="results-title">Level Complete!</h1>
      <div className="results-stars">{starDisplay}</div>
      <div className="results-stats">
        <div className="stat">
          <div className="stat-value">{results.score.toLocaleString()}</div>
          <div className="stat-label">Score</div>
        </div>
        <div className="stat">
          <div className="stat-value">{Math.round(results.accuracy * 100)}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat">
          <div className="stat-value">{results.bestCombo}x</div>
          <div className="stat-label">Best Combo</div>
        </div>
      </div>
      <div className="results-buttons">
        <button className="btn btn-secondary" onClick={() => navigate('/levels')}>
          Levels
        </button>
        <button className="btn btn-primary" onClick={() => navigate(`/play/${results.levelId}`)}>
          Retry
        </button>
      </div>
    </div>
  );
}

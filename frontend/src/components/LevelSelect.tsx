import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LevelConfig } from '../game/types';
import { getLevels, isLevelUnlocked } from '../services/progress';
import { loadPlayerData } from '../services/storage';

export function LevelSelect() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const playerData = loadPlayerData();

  useEffect(() => {
    getLevels().then(setLevels);
  }, []);

  const handleLevelClick = (level: LevelConfig) => {
    if (isLevelUnlocked(level.id, levels)) {
      navigate(`/play/${level.id}`);
    }
  };

  const renderStars = (levelId: number) => {
    const score = playerData.levelScores[levelId];
    const stars = score?.stars || 0;
    return (
      <div className="level-stars">
        {[1, 2, 3].map(i => (
          <span key={i} className={stars >= i ? 'earned' : ''}>
            {stars >= i ? '\u2605' : '\u2606'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="menu-screen" style={{ position: 'relative' }}>
      <button className="btn-back" onClick={() => navigate('/characters')}>Change Character</button>
      <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Select Level</h2>
      <div className="level-grid">
        {levels.map(level => {
          const unlocked = isLevelUnlocked(level.id, levels);
          return (
            <div
              key={level.id}
              className={`level-card ${unlocked ? '' : 'locked'}`}
              onClick={() => handleLevelClick(level)}
            >
              <div className="level-number">{level.id}</div>
              <div className="level-name">{level.name}</div>
              {unlocked ? renderStars(level.id) : (
                <div className="level-stars">{'\uD83D\uDD12'}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

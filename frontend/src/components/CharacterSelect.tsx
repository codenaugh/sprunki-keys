import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadPlayerData, savePlayerData } from '../services/storage';
import { CHARACTERS } from '../game/data/characters';
export function CharacterSelect() {
  const navigate = useNavigate();
  const playerData = loadPlayerData();
  const [selected, setSelected] = useState(playerData.selectedCharacterId);

  const handleSelect = (id: string) => {
    setSelected(id);
    const data = loadPlayerData();
    data.selectedCharacterId = id;
    savePlayerData(data);
  };

  return (
    <div className="menu-screen" style={{ position: 'relative' }}>
      <button className="btn-back" onClick={() => navigate('/')}>Home</button>
      <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Choose Your Sprunki</h2>
      <div className="character-grid">
        {CHARACTERS.map(char => (
          <div
            key={char.id}
            className={`character-card ${selected === char.id ? 'selected' : ''}`}
            onClick={() => handleSelect(char.id)}
          >
            <div className="character-avatar" style={{ background: 'transparent' }}>
              <img
                src={`/assets/sprites/characters/${char.id}.png`}
                alt={char.displayName}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>
            <div className="character-name">{char.displayName}</div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: '24px' }}
        onClick={() => navigate('/levels')}
      >
        Continue
      </button>
    </div>
  );
}

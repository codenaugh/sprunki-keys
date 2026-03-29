import { useNavigate } from 'react-router-dom';

export function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="menu-screen">
      <h1 className="game-title">Sprunki Type</h1>
      <p className="game-subtitle">Learn to type with your favorite Sprunkis!</p>
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/characters')}>
          Play
        </button>
        <button className="btn btn-secondary btn-small" onClick={() => navigate('/settings')}>
          Settings
        </button>
      </div>
    </div>
  );
}

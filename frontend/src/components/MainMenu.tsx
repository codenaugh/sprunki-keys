import { useNavigate } from 'react-router-dom';

export function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="menu-screen">
      <h1 className="game-title">Sprunki Keys</h1>
      <p className="game-subtitle">Learn to type with your favorite Sprunkis!</p>
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/characters')}>
          Play
        </button>
        <button className="btn btn-secondary btn-small" onClick={() => navigate('/settings')}>
          Settings
        </button>
      </div>
      <p style={{ marginTop: '32px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
        Your browser may ask for permission to access keyboard input — this is needed for gameplay.
      </p>
    </div>
  );
}

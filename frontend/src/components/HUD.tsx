import { useSyncExternalStore, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreStore } from '../game/ScoreStore';
import { EventBus } from '../game/EventBus';
import { getSettings, saveSettings } from '../services/storage';

export function HUD() {
  const { score, combo, multiplier } = useSyncExternalStore(
    scoreStore.subscribe,
    scoreStore.getSnapshot,
  );
  const [paused, setPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const navigate = useNavigate();

  useEffect(() => {
    const onPaused = () => setPaused(true);
    const onResumed = () => {
      setPaused(false);
      setShowSettings(false);
    };
    EventBus.on('game-paused', onPaused);
    EventBus.on('game-resumed', onResumed);
    return () => {
      EventBus.off('game-paused', onPaused);
      EventBus.off('game-resumed', onResumed);
    };
  }, []);

  const handlePause = () => {
    EventBus.emit('game-pause');
  };

  const handleSettings = () => {
    EventBus.emit('game-pause');
    setShowSettings(true);
  };

  const handleResume = () => {
    EventBus.emit('game-resume');
  };

  const handleRestart = () => {
    setPaused(false);
    setShowSettings(false);
    EventBus.emit('game-restart');
  };

  const handleQuit = () => {
    navigate('/levels');
  };

  const handleVolume = (key: 'musicVolume' | 'sfxVolume', value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    EventBus.emit('settings-changed', updated);
  };

  return (
    <>
      <div className="hud-overlay">
        <div className="hud-score">{score.toLocaleString()}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', pointerEvents: 'auto' }}>
          {combo > 1 && (
            <div className="hud-combo">
              {combo}x Combo! ({multiplier.toFixed(1)}x)
            </div>
          )}
          <button className="btn-hud" onClick={handleSettings} title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <button className="btn-hud" onClick={handlePause} title="Pause">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
      {paused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>
              {showSettings ? 'Settings' : 'Paused'}
            </h2>
            {showSettings ? (
              <div className="settings-panel">
                <div className="setting-row">
                  <span className="setting-label">Music Volume</span>
                  <input
                    type="range"
                    className="setting-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.musicVolume}
                    onChange={e => handleVolume('musicVolume', parseFloat(e.target.value))}
                  />
                </div>
                <div className="setting-row">
                  <span className="setting-label">Sound Effects</span>
                  <input
                    type="range"
                    className="setting-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.sfxVolume}
                    onChange={e => handleVolume('sfxVolume', parseFloat(e.target.value))}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={handleResume}
                >
                  Resume
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleResume}>Resume</button>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '12px' }}
                  onClick={handleRestart}
                >
                  Restart
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '12px' }}
                  onClick={() => setShowSettings(true)}
                >
                  Settings
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '12px' }}
                  onClick={handleQuit}
                >
                  Quit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

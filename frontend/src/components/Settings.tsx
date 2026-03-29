import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../services/storage';
import { EventBus } from '../game/EventBus';

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());

  const handleChange = (key: 'musicVolume' | 'sfxVolume', value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    EventBus.emit('settings-changed', updated);
  };

  return (
    <div className="menu-screen" style={{ position: 'relative' }}>
      <button className="btn-back" onClick={() => navigate('/')}>Back</button>
      <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '32px' }}>Settings</h2>
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
            onChange={e => handleChange('musicVolume', parseFloat(e.target.value))}
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
            onChange={e => handleChange('sfxVolume', parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

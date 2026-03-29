import type { PlayerData, LevelScore, GameSettings } from '../game/types';

const STORAGE_KEY = 'sprunki-type-player';

const DEFAULT_PLAYER_DATA: PlayerData = {
  selectedCharacterId: 'pinki',
  levelScores: {},
  settings: { musicVolume: 0.5, sfxVolume: 0.7 },
  totalStars: 0,
};

export function loadPlayerData(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_DATA };
    return { ...DEFAULT_PLAYER_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PLAYER_DATA };
  }
}

export function savePlayerData(data: PlayerData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveLevelScore(levelId: number, score: LevelScore): void {
  const data = loadPlayerData();
  const existing = data.levelScores[levelId];
  if (!existing || score.bestScore > existing.bestScore) {
    data.levelScores[levelId] = score;
    data.totalStars = Object.values(data.levelScores).reduce((sum, s) => sum + s.stars, 0);
    savePlayerData(data);
  }
}

export function getSettings(): GameSettings {
  return loadPlayerData().settings;
}

export function saveSettings(settings: GameSettings): void {
  const data = loadPlayerData();
  data.settings = settings;
  savePlayerData(data);
}

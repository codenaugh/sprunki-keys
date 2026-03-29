export interface LevelConfig {
  id: number;
  name: string;
  tier: number;
  scrollSpeed: number;
  speedIncrement: number;
  timingWindowMs: number;
  wordCount: number;
  allowedRows: string[];
  requireShift: boolean;
  speedWords: boolean;
  unlockRequirement: number;
  starThresholds: [number, number, number];
}

export interface WordData {
  text: string;
  tier: number;
  rows: string[];
  length: number;
}

export interface PlayerData {
  selectedCharacterId: string;
  levelScores: Record<number, LevelScore>;
  settings: GameSettings;
  totalStars: number;
}

export interface LevelScore {
  bestScore: number;
  stars: number;
  accuracy: number;
  bestCombo: number;
  completedAt: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  displayName: string;
  bodyColor: number;
  bodyShape: 'round' | 'oval' | 'tall' | 'custom';
  features: FeatureDef[];
  eyeStyle: 'normal' | 'wide' | 'mismatched' | 'inverted' | 'hidden';
  hasEyelashes: boolean;
}

export interface FeatureDef {
  type: string;
  color?: number;
}

export type TimingQuality = 'perfect' | 'good' | 'ok';
export type PlayerAnimState = 'run' | 'jump' | 'grab' | 'stumble' | 'celebrate';

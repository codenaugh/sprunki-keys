import type { LevelConfig, WordData } from '../game/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchLevels(): Promise<LevelConfig[]> {
  const res = await fetch(`${API_BASE}/api/levels`);
  if (!res.ok) throw new Error(`Failed to fetch levels: ${res.status}`);
  return res.json();
}

export async function fetchLevel(id: number): Promise<LevelConfig> {
  const res = await fetch(`${API_BASE}/api/levels/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch level ${id}: ${res.status}`);
  return res.json();
}

export async function fetchWords(tier: number): Promise<WordData[]> {
  const res = await fetch(`${API_BASE}/api/words?tier=${tier}`);
  if (!res.ok) throw new Error(`Failed to fetch words for tier ${tier}: ${res.status}`);
  return res.json();
}

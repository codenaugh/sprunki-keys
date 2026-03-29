/**
 * External store for score state, bridging Phaser and React.
 * Uses useSyncExternalStore-compatible API for reliable React updates.
 */

export interface ScoreSnapshot {
  score: number;
  combo: number;
  multiplier: number;
}

let snapshot: ScoreSnapshot = { score: 0, combo: 0, multiplier: 1 };
const listeners = new Set<() => void>();

export const scoreStore = {
  getSnapshot(): ScoreSnapshot {
    return snapshot;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(score: number, combo: number, multiplier: number) {
    snapshot = { score, combo, multiplier };
    for (const listener of listeners) {
      listener();
    }
  },

  reset() {
    snapshot = { score: 0, combo: 0, multiplier: 1 };
    for (const listener of listeners) {
      listener();
    }
  },
};

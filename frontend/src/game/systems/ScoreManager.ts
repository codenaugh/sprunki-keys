import type { TimingQuality } from '../types';
import { EventBus } from '../EventBus';
import { scoreStore } from '../ScoreStore';

const BASE_POINTS: Record<TimingQuality, number> = {
  perfect: 100,
  good: 70,
  ok: 40,
};

export class ScoreManager {
  score = 0;
  combo = 0;
  multiplier = 1;
  bestCombo = 0;
  hits = 0;
  misses = 0;
  wrongs = 0;

  onLetterGrabbed(quality: TimingQuality) {
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    this.multiplier = 1 + Math.floor(this.combo / 5) * 0.5;
    this.score += Math.round(BASE_POINTS[quality] * this.multiplier);
    this.hits++;
    this.emitUpdate();
  }

  onWordComplete(wordLength: number, allGrabbed: boolean) {
    if (allGrabbed) {
      // Bonus for grabbing every letter: 50 points per letter
      const bonus = wordLength * 50;
      this.score += Math.round(bonus * this.multiplier);
      this.emitUpdate();
    }
  }

  onLetterMissed() {
    this.combo = 0;
    this.multiplier = 1;
    this.misses++;
    this.emitUpdate();
  }

  onWrongKey() {
    this.combo = 0;
    this.multiplier = 1;
    this.wrongs++;
    this.emitUpdate();
  }

  getAccuracy(): number {
    const total = this.hits + this.misses + this.wrongs;
    if (total === 0) return 1;
    return this.hits / total;
  }

  getStars(thresholds: [number, number, number]): number {
    if (this.score >= thresholds[2]) return 3;
    if (this.score >= thresholds[1]) return 2;
    if (this.score >= thresholds[0]) return 1;
    return 0;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.bestCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.wrongs = 0;
    this.emitUpdate();
  }

  private emitUpdate() {
    const data = {
      score: this.score,
      combo: this.combo,
      multiplier: this.multiplier,
    };
    EventBus.emit('score-update', data);
    scoreStore.update(data.score, data.combo, data.multiplier);
  }
}

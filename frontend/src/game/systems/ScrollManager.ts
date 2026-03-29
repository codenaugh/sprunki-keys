export class ScrollManager {
  baseSpeed: number;
  currentSpeed: number;
  private penaltyUntil = 0;
  private penaltyFactor = 0.3;

  constructor(baseSpeed: number) {
    this.baseSpeed = baseSpeed;
    this.currentSpeed = baseSpeed;
  }

  update(time: number) {
    if (time < this.penaltyUntil) {
      this.currentSpeed = this.baseSpeed * this.penaltyFactor;
    } else {
      this.currentSpeed = this.baseSpeed;
    }
  }

  applyPenalty(durationMs: number) {
    this.penaltyUntil = Date.now() + durationMs;
  }

  increaseSpeed(amount: number) {
    this.baseSpeed += amount;
  }

  getPixelsPerFrame(delta: number): number {
    return (this.currentSpeed * delta) / 1000;
  }
}

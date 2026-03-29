import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private listeners: Array<(key: string) => void> = [];
  private cooldownMs = 80;
  private lastKeyTime = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.keyboard!.on('keydown', this.handleKeyDown, this);
  }

  onKeyPress(callback: (key: string) => void) {
    this.listeners.push(callback);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const now = Date.now();
    if (now - this.lastKeyTime < this.cooldownMs) return;

    // Only handle printable characters
    if (event.key.length === 1) {
      this.lastKeyTime = now;
      for (const listener of this.listeners) {
        listener(event.key);
      }
    }
  }

  destroy() {
    this.scene.input.keyboard?.off('keydown', this.handleKeyDown, this);
    this.listeners = [];
  }
}

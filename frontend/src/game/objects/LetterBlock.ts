import Phaser from 'phaser';
import type { TimingQuality } from '../types';

export class LetterBlock {
  private scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  letter: string;
  worldX: number;
  private bg: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private glow: Phaser.GameObjects.Graphics;
  grabbed = false;
  missed = false;
  private bobOffset: number;
  private timingWindowPx: number;

  constructor(scene: Phaser.Scene, x: number, y: number, letter: string, timingWindowPx: number) {
    this.scene = scene;
    this.letter = letter;
    this.worldX = x;
    this.timingWindowPx = timingWindowPx;
    this.bobOffset = Math.random() * Math.PI * 2;

    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // Glow (hidden until active)
    this.glow = scene.add.graphics();
    this.glow.fillStyle(0xf1c40f, 0.3);
    this.glow.fillCircle(0, 0, 32);
    this.glow.setAlpha(0);
    this.container.add(this.glow);

    // Background circle
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x3498db);
    this.bg.fillCircle(0, 0, 24);
    this.bg.lineStyle(3, 0xffffff, 0.8);
    this.bg.strokeCircle(0, 0, 24);
    this.container.add(this.bg);

    // Letter text
    this.text = scene.add.text(0, 0, letter, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.text.setOrigin(0.5);
    this.container.add(this.text);
  }

  update(delta: number, cameraOffset: number) {
    if (this.grabbed || this.missed) return;

    // Floating bob animation
    this.bobOffset += delta * 0.003;
    const baseY = this.container.getData('baseY') ?? this.container.y;
    if (!this.container.getData('baseY')) this.container.setData('baseY', this.container.y);
    this.container.y = baseY + Math.sin(this.bobOffset) * 6;

    // Update screen position based on world position and camera
    this.container.x = this.worldX - cameraOffset;

    // Check if in timing window (relative to player position at x=200)
    const distToPlayer = Math.abs(this.container.x - 200);
    if (distToPlayer < this.timingWindowPx) {
      this.glow.setAlpha(0.5 + Math.sin(Date.now() * 0.01) * 0.3);
    } else {
      this.glow.setAlpha(0);
    }
  }

  /** Calculate timing quality using real-time position from cameraOffset */
  getTimingQuality(playerScreenX: number, cameraOffset: number): TimingQuality | null {
    if (this.grabbed || this.missed) return null;

    // Calculate current screen position directly (don't rely on container.x which may be stale)
    const screenX = this.worldX - cameraOffset;
    const dist = Math.abs(screenX - playerScreenX);

    if (dist < this.timingWindowPx * 0.3) return 'perfect';
    if (dist < this.timingWindowPx * 0.65) return 'good';
    if (dist < this.timingWindowPx) return 'ok';
    return null;
  }

  grab() {
    this.grabbed = true;
    this.glow.setAlpha(0);

    // Green flash
    this.bg.clear();
    this.bg.fillStyle(0x2ecc71);
    this.bg.fillCircle(0, 0, 24);

    // Sparkle and fade out
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y - 40,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.container.destroy();
      },
    });

    // Spawn sparkle particles
    this.spawnSparkles();
  }

  miss() {
    this.missed = true;
    this.glow.setAlpha(0);

    // Red flash
    this.bg.clear();
    this.bg.fillStyle(0xe74c3c, 0.5);
    this.bg.fillCircle(0, 0, 24);
    this.text.setAlpha(0.4);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y + 30,
      duration: 500,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.container.destroy();
      },
    });
  }

  wrongKey() {
    // Shake animation
    const origX = this.container.x;
    this.scene.tweens.add({
      targets: this.container,
      x: origX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.container.x = origX;
      },
    });

    // Brief red flash on bg
    this.bg.clear();
    this.bg.fillStyle(0xe74c3c);
    this.bg.fillCircle(0, 0, 24);
    this.bg.lineStyle(3, 0xffffff, 0.8);
    this.bg.strokeCircle(0, 0, 24);

    this.scene.time.delayedCall(300, () => {
      if (!this.grabbed && !this.missed) {
        this.bg.clear();
        this.bg.fillStyle(0x3498db);
        this.bg.fillCircle(0, 0, 24);
        this.bg.lineStyle(3, 0xffffff, 0.8);
        this.bg.strokeCircle(0, 0, 24);
      }
    });
  }

  private spawnSparkles() {
    const colors = [0xf1c40f, 0x2ecc71, 0xe94560, 0x3498db];
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.fillStyle(color);
      sparkle.fillCircle(0, 0, 3 + Math.random() * 3);
      sparkle.setPosition(this.container.x, this.container.y);
      sparkle.setDepth(15);

      const angle = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 30;

      this.scene.tweens.add({
        targets: sparkle,
        x: sparkle.x + Math.cos(angle) * dist,
        y: sparkle.y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  getScreenX(cameraOffset: number): number {
    return this.worldX - cameraOffset;
  }

  isOffScreen(): boolean {
    return this.container.x < -50;
  }
}

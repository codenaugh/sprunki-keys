import Phaser from 'phaser';
import type { TimingQuality } from '../types';

export class LetterBlock {
  private scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  letter: string;
  worldX: number;
  private bg: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private shadow: Phaser.GameObjects.Graphics;
  grabbed = false;
  missed = false;
  private bobOffset: number;
  private dangerZone = 150;
  private flashing = false;

  constructor(scene: Phaser.Scene, x: number, y: number, letter: string, _timingWindowPx: number) {
    this.scene = scene;
    this.letter = letter;
    this.worldX = x;
    this.bobOffset = Math.random() * Math.PI * 2;

    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // Soft drop shadow
    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.2);
    this.shadow.fillRoundedRect(-22, -18, 44, 44, 10);
    this.shadow.setPosition(3, 4);
    this.container.add(this.shadow);

    // Background — rounded rectangle with layered fill for depth
    this.bg = scene.add.graphics();
    this.drawBg(0x4a7dbd, 0x3a6ba8);
    this.container.add(this.bg);

    // Letter text
    this.text = scene.add.text(0, 2, letter.toUpperCase(), {
      fontSize: '22px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.text.setOrigin(0.5);
    this.text.setShadow(1, 1, 'rgba(0,0,0,0.3)', 2);
    this.container.add(this.text);
  }

  private drawBg(fill: number, darker: number) {
    this.bg.clear();
    // Main rounded rect
    this.bg.fillStyle(fill);
    this.bg.fillRoundedRect(-20, -20, 40, 40, 10);
    // Bottom edge for depth
    this.bg.fillStyle(darker);
    this.bg.fillRoundedRect(-20, -10, 40, 30, { tl: 0, tr: 0, bl: 10, br: 10 });
    // Top highlight
    this.bg.fillStyle(0xffffff, 0.15);
    this.bg.fillRoundedRect(-16, -17, 32, 14, { tl: 8, tr: 8, bl: 0, br: 0 });
    // Border
    this.bg.lineStyle(2, 0xffffff, 0.3);
    this.bg.strokeRoundedRect(-20, -20, 40, 40, 10);
  }

  update(delta: number, cameraOffset: number) {
    if (this.grabbed || this.missed) return;

    // Floating bob animation
    this.bobOffset += delta * 0.003;
    const baseY = this.container.getData('baseY') ?? this.container.y;
    if (!this.container.getData('baseY')) this.container.setData('baseY', this.container.y);
    this.container.y = baseY + Math.sin(this.bobOffset) * 5;

    // Gentle rotation
    this.container.angle = Math.sin(this.bobOffset * 0.7 + 0.5) * 3;

    // Update screen position based on world position and camera
    this.container.x = this.worldX - cameraOffset;

    // Flash red when letter is about to scroll past the player
    if (this.container.x < 200 + this.dangerZone && this.container.x > -50) {
      const urgency = 1 - ((this.container.x - (-50)) / (200 + this.dangerZone + 50));
      const flash = Math.sin(Date.now() * 0.012) > 0;
      if (urgency > 0.3 && flash && !this.flashing) {
        this.drawBg(0xbd4a4a, 0xa83a3a);
        this.flashing = true;
      } else if (!flash && this.flashing) {
        this.drawBg(0x4a7dbd, 0x3a6ba8);
        this.flashing = false;
      }
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

    // Green flash
    this.drawBg(0x4ebd6b, 0x38a855);

    // Float up and fade
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y - 50,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      angle: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.container.destroy();
      },
    });

    this.spawnSparkles();
  }

  miss() {
    this.missed = true;

    // Red and faded
    this.drawBg(0xbd4a4a, 0xa83a3a);
    this.text.setAlpha(0.4);
    this.container.setScale(1);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y + 30,
      angle: 15,
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

    // Brief red flash
    this.drawBg(0xbd4a4a, 0xa83a3a);

    this.scene.time.delayedCall(300, () => {
      if (!this.grabbed && !this.missed) {
        this.drawBg(0x4a7dbd, 0x3a6ba8);
      }
    });
  }

  private spawnSparkles() {
    const colors = [0xf5c842, 0x4ebd6b, 0xe94560, 0x5dade2, 0xffffff];
    for (let i = 0; i < 10; i++) {
      const sparkle = this.scene.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.fillStyle(color);
      const size = 2 + Math.random() * 3;
      sparkle.fillRoundedRect(-size / 2, -size / 2, size, size, 1);
      sparkle.setPosition(this.container.x, this.container.y);
      sparkle.setDepth(15);

      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
      const dist = 25 + Math.random() * 35;

      this.scene.tweens.add({
        targets: sparkle,
        x: sparkle.x + Math.cos(angle) * dist,
        y: sparkle.y + Math.sin(angle) * dist - 15,
        alpha: 0,
        duration: 350 + Math.random() * 250,
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

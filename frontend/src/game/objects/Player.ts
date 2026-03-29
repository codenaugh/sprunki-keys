import Phaser from 'phaser';

export class Player {
  private scene: Phaser.Scene;
  body: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private baseY: number;
  private isJumping = false;
  private isStumbling = false;
  private bobOffset = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey?: string) {
    this.scene = scene;
    this.baseY = y;

    this.body = scene.add.container(x, y);

    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(0, -4, textureKey);
      this.sprite.setScale(1.2);
    } else {
      // Fallback: simple colored circle
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xff69b4);
      gfx.fillEllipse(0, 0, 50, 56);
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(-10, -8, 14, 16);
      gfx.fillEllipse(10, -8, 14, 16);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(-8, -7, 4);
      gfx.fillCircle(12, -7, 4);
      this.sprite = gfx;
    }

    this.body.add(this.sprite);
    this.body.setDepth(10);
  }

  update(delta: number) {
    if (!this.isJumping && !this.isStumbling) {
      this.bobOffset += delta * 0.006;
      this.body.y = this.baseY + Math.sin(this.bobOffset) * 4;
      const scale = 1 + Math.sin(this.bobOffset) * 0.03;
      this.body.setScale(1, scale);
    }
  }

  jump(targetY: number, onPeak: () => void) {
    if (this.isJumping) return;
    this.isJumping = true;

    this.scene.tweens.add({
      targets: this.body,
      y: targetY,
      scaleX: 0.9,
      scaleY: 1.15,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        onPeak();
        this.scene.tweens.add({
          targets: this.body,
          y: this.baseY,
          scaleX: 1.1,
          scaleY: 0.9,
          duration: 250,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.body.setScale(1, 1);
            this.isJumping = false;
          },
        });
      },
    });
  }

  stumble() {
    if (this.isStumbling) return;
    this.isStumbling = true;

    this.scene.tweens.add({
      targets: this.body,
      scaleX: 1.2,
      scaleY: 0.75,
      angle: -15,
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.body.setScale(1, 1);
        this.body.angle = 0;
        this.isStumbling = false;
      },
    });
  }

  celebrate() {
    this.scene.tweens.add({
      targets: this.body,
      y: this.baseY - 40,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Bounce.easeOut',
    });
  }
}

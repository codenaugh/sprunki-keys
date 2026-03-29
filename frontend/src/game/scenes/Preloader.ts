import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { CHARACTERS } from '../data/characters';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    for (const char of CHARACTERS) {
      this.load.image(`char-${char.id}`, `/assets/sprites/characters/${char.id}.png`);
    }
  }

  create() {
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x8b4513);
    groundGfx.fillRect(0, 0, 64, 64);
    groundGfx.generateTexture('ground', 64, 64);
    groundGfx.destroy();

    const skyGfx = this.add.graphics();
    for (let y = 0; y < 576; y++) {
      const t = y / 576;
      const r = Math.floor(135 + t * 120);
      const g = Math.floor(206 + t * 49);
      const b = Math.floor(235 + t * 20);
      skyGfx.fillStyle((r << 16) | (g << 8) | b);
      skyGfx.fillRect(0, y, 1024, 1);
    }
    skyGfx.generateTexture('sky-bg', 1024, 576);
    skyGfx.destroy();

    const hillGfx = this.add.graphics();
    hillGfx.fillStyle(0x4a8c3f);
    hillGfx.beginPath();
    hillGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 16) {
      hillGfx.lineTo(x, 200 - Math.sin((x / 512) * Math.PI) * 80);
    }
    hillGfx.lineTo(512, 200);
    hillGfx.closePath();
    hillGfx.fillPath();
    hillGfx.generateTexture('hills', 512, 200);
    hillGfx.destroy();

    EventBus.emit('current-scene-ready', this);
  }
}

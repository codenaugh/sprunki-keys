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
    // Ground — warm earth tones with grass
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x5a4232);
    groundGfx.fillRect(0, 0, 64, 64);
    groundGfx.fillStyle(0x6b5040);
    groundGfx.fillRect(0, 10, 64, 6);
    groundGfx.fillRect(0, 34, 64, 6);
    groundGfx.fillRect(0, 52, 64, 6);
    groundGfx.fillStyle(0x6b9e5a);
    groundGfx.fillRect(0, 0, 64, 7);
    groundGfx.fillStyle(0x7db86a);
    groundGfx.fillRect(0, 0, 64, 3);
    groundGfx.generateTexture('ground', 64, 64);
    groundGfx.destroy();

    // Sky — lofi sunset gradient (deep purple → warm pink → soft peach → golden)
    const skyGfx = this.add.graphics();
    for (let y = 0; y < 576; y++) {
      const t = y / 576;
      let r: number, g: number, b: number;
      if (t < 0.4) {
        // Top: deep indigo to soft purple
        const s = t / 0.4;
        r = Math.floor(45 + s * 80);
        g = Math.floor(30 + s * 50);
        b = Math.floor(100 + s * 50);
      } else if (t < 0.7) {
        // Middle: purple to warm pink/peach
        const s = (t - 0.4) / 0.3;
        r = Math.floor(125 + s * 110);
        g = Math.floor(80 + s * 90);
        b = Math.floor(150 - s * 50);
      } else {
        // Bottom: peach to golden horizon
        const s = (t - 0.7) / 0.3;
        r = Math.floor(235 + s * 15);
        g = Math.floor(170 + s * 50);
        b = Math.floor(100 + s * 30);
      }
      skyGfx.fillStyle((r << 16) | (g << 8) | b);
      skyGfx.fillRect(0, y, 1024, 1);
    }
    skyGfx.generateTexture('sky-bg', 1024, 576);
    skyGfx.destroy();

    // Far hills — dark silhouette with purple tint
    const farHillGfx = this.add.graphics();
    farHillGfx.fillStyle(0x3d2e50);
    farHillGfx.beginPath();
    farHillGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI) * 110
        + Math.sin((x / 180) * Math.PI + 1) * 25
        + Math.sin((x / 70) * Math.PI) * 10;
      farHillGfx.lineTo(x, 200 - h);
    }
    farHillGfx.lineTo(512, 200);
    farHillGfx.closePath();
    farHillGfx.fillPath();
    farHillGfx.generateTexture('hills-far', 512, 200);
    farHillGfx.destroy();

    // Near hills — warmer green with subtle highlight
    const nearHillGfx = this.add.graphics();
    nearHillGfx.fillStyle(0x4a6e42);
    nearHillGfx.beginPath();
    nearHillGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI * 1.5 + 0.5) * 65
        + Math.sin((x / 130) * Math.PI) * 18
        + Math.sin((x / 50) * Math.PI) * 6;
      nearHillGfx.lineTo(x, 200 - h);
    }
    nearHillGfx.lineTo(512, 200);
    nearHillGfx.closePath();
    nearHillGfx.fillPath();
    // Soft highlight edge
    nearHillGfx.fillStyle(0x5a8a50);
    nearHillGfx.beginPath();
    nearHillGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI * 1.5 + 0.5) * 65
        + Math.sin((x / 130) * Math.PI) * 18
        + Math.sin((x / 50) * Math.PI) * 6;
      nearHillGfx.lineTo(x, 200 - h + 5);
    }
    nearHillGfx.lineTo(512, 200);
    nearHillGfx.closePath();
    nearHillGfx.fillPath();
    nearHillGfx.generateTexture('hills', 512, 200);
    nearHillGfx.destroy();

    // Soft cloud texture
    const cloudGfx = this.add.graphics();
    cloudGfx.fillStyle(0xffeedd);
    cloudGfx.setAlpha(0.4);
    cloudGfx.fillEllipse(40, 24, 56, 26);
    cloudGfx.fillEllipse(68, 22, 44, 22);
    cloudGfx.fillEllipse(18, 24, 32, 20);
    cloudGfx.fillEllipse(50, 18, 34, 18);
    cloudGfx.generateTexture('cloud', 96, 44);
    cloudGfx.destroy();

    EventBus.emit('current-scene-ready', this);
  }
}

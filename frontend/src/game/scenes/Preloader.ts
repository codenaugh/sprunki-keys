import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { CHARACTERS } from '../data/characters';

interface SkyColors {
  top: [number, number, number];
  mid: [number, number, number];
  bottom: [number, number, number];
}

interface HillColors {
  far: number;
  near: number;
  highlight: number;
}

const TIER_SKIES: Record<number, SkyColors> = {
  // Tier 1: Warm sunset (lofi vibes)
  1: {
    top: [45, 30, 100],
    mid: [180, 100, 130],
    bottom: [245, 200, 120],
  },
  // Tier 2: Cool morning blue
  2: {
    top: [25, 40, 90],
    mid: [70, 130, 190],
    bottom: [170, 210, 240],
  },
  // Tier 3: Twilight purple
  3: {
    top: [30, 15, 60],
    mid: [100, 50, 120],
    bottom: [200, 130, 160],
  },
  // Tier 4: Night sky
  4: {
    top: [10, 10, 30],
    mid: [20, 25, 60],
    bottom: [50, 60, 100],
  },
};

const TIER_HILLS: Record<number, HillColors> = {
  1: { far: 0x3d2e50, near: 0x4a6e42, highlight: 0x5a8a50 },
  2: { far: 0x2a4a3a, near: 0x3a7a5a, highlight: 0x4a9a6a },
  3: { far: 0x2e1e3e, near: 0x4a4060, highlight: 0x5a5075 },
  4: { far: 0x151525, near: 0x252540, highlight: 0x353555 },
};

const TIER_GROUND: Record<number, { base: number; stripe: number; grass: number; grassTop: number }> = {
  1: { base: 0x5a4232, stripe: 0x6b5040, grass: 0x6b9e5a, grassTop: 0x7db86a },
  2: { base: 0x4a3a2a, stripe: 0x5a4838, grass: 0x5a9a6a, grassTop: 0x6ab07a },
  3: { base: 0x3a2a3a, stripe: 0x4a3848, grass: 0x5a7a6a, grassTop: 0x6a907a },
  4: { base: 0x252530, stripe: 0x353540, grass: 0x3a5a4a, grassTop: 0x4a6a5a },
};

const TIER_CLOUD: Record<number, { color: number; alpha: number }> = {
  1: { color: 0xffeedd, alpha: 0.4 },
  2: { color: 0xffffff, alpha: 0.5 },
  3: { color: 0xe8d0f0, alpha: 0.3 },
  4: { color: 0x8888aa, alpha: 0.15 },
};

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    for (const char of CHARACTERS) {
      this.load.image(`char-${char.id}`, `/assets/sprites/characters/${char.id}.png`);
    }
    this.load.image('char-hanna', '/assets/sprites/characters/hanna.png');
  }

  create() {
    for (let tier = 1; tier <= 4; tier++) {
      this.generateSky(tier);
      this.generateHills(tier);
      this.generateGround(tier);
      this.generateCloud(tier);
    }

    EventBus.emit('current-scene-ready', this);
  }

  private generateSky(tier: number) {
    const sky = TIER_SKIES[tier];
    const gfx = this.add.graphics();

    for (let y = 0; y < 576; y++) {
      const t = y / 576;
      let r: number, g: number, b: number;
      if (t < 0.4) {
        const s = t / 0.4;
        r = Math.floor(sky.top[0] + s * (sky.mid[0] - sky.top[0]));
        g = Math.floor(sky.top[1] + s * (sky.mid[1] - sky.top[1]));
        b = Math.floor(sky.top[2] + s * (sky.mid[2] - sky.top[2]));
      } else {
        const s = (t - 0.4) / 0.6;
        r = Math.floor(sky.mid[0] + s * (sky.bottom[0] - sky.mid[0]));
        g = Math.floor(sky.mid[1] + s * (sky.bottom[1] - sky.mid[1]));
        b = Math.floor(sky.mid[2] + s * (sky.bottom[2] - sky.mid[2]));
      }
      gfx.fillStyle((r << 16) | (g << 8) | b);
      gfx.fillRect(0, y, 1024, 1);
    }

    // Add stars for tier 4 (night)
    if (tier === 4) {
      for (let i = 0; i < 60; i++) {
        const sx = Math.random() * 1024;
        const sy = Math.random() * 350;
        const size = 0.5 + Math.random() * 1.5;
        const alpha = 0.3 + Math.random() * 0.7;
        gfx.fillStyle(0xffffff, alpha);
        gfx.fillCircle(sx, sy, size);
      }
    }

    gfx.generateTexture(`sky-bg-${tier}`, 1024, 576);
    gfx.destroy();
  }

  private generateHills(tier: number) {
    const colors = TIER_HILLS[tier];

    // Far hills
    const farGfx = this.add.graphics();
    farGfx.fillStyle(colors.far);
    farGfx.beginPath();
    farGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI) * 110
        + Math.sin((x / 180) * Math.PI + 1) * 25
        + Math.sin((x / 70) * Math.PI) * 10;
      farGfx.lineTo(x, 200 - h);
    }
    farGfx.lineTo(512, 200);
    farGfx.closePath();
    farGfx.fillPath();
    farGfx.generateTexture(`hills-far-${tier}`, 512, 200);
    farGfx.destroy();

    // Near hills
    const nearGfx = this.add.graphics();
    nearGfx.fillStyle(colors.near);
    nearGfx.beginPath();
    nearGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI * 1.5 + 0.5) * 65
        + Math.sin((x / 130) * Math.PI) * 18
        + Math.sin((x / 50) * Math.PI) * 6;
      nearGfx.lineTo(x, 200 - h);
    }
    nearGfx.lineTo(512, 200);
    nearGfx.closePath();
    nearGfx.fillPath();
    // Highlight edge
    nearGfx.fillStyle(colors.highlight);
    nearGfx.beginPath();
    nearGfx.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 4) {
      const h = Math.sin((x / 512) * Math.PI * 1.5 + 0.5) * 65
        + Math.sin((x / 130) * Math.PI) * 18
        + Math.sin((x / 50) * Math.PI) * 6;
      nearGfx.lineTo(x, 200 - h + 5);
    }
    nearGfx.lineTo(512, 200);
    nearGfx.closePath();
    nearGfx.fillPath();
    nearGfx.generateTexture(`hills-${tier}`, 512, 200);
    nearGfx.destroy();
  }

  private generateGround(tier: number) {
    const colors = TIER_GROUND[tier];
    const gfx = this.add.graphics();
    gfx.fillStyle(colors.base);
    gfx.fillRect(0, 0, 64, 64);
    gfx.fillStyle(colors.stripe);
    gfx.fillRect(0, 10, 64, 6);
    gfx.fillRect(0, 34, 64, 6);
    gfx.fillRect(0, 52, 64, 6);
    gfx.fillStyle(colors.grass);
    gfx.fillRect(0, 0, 64, 7);
    gfx.fillStyle(colors.grassTop);
    gfx.fillRect(0, 0, 64, 3);
    gfx.generateTexture(`ground-${tier}`, 64, 64);
    gfx.destroy();
  }

  private generateCloud(tier: number) {
    const cfg = TIER_CLOUD[tier];
    const gfx = this.add.graphics();
    gfx.fillStyle(cfg.color);
    gfx.setAlpha(cfg.alpha);
    gfx.fillEllipse(40, 24, 56, 26);
    gfx.fillEllipse(68, 22, 44, 22);
    gfx.fillEllipse(18, 24, 32, 20);
    gfx.fillEllipse(50, 18, 34, 18);
    gfx.generateTexture(`cloud-${tier}`, 96, 44);
    gfx.destroy();
  }
}

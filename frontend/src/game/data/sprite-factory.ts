import Phaser from 'phaser';
import type { CharacterDef } from '../types';

const W = 80;
const H = 96;
const CX = W / 2;
const CY = H / 2 + 8;

export function generateCharacterTexture(scene: Phaser.Scene, charDef: CharacterDef): string {
  const textureKey = `char-${charDef.id}`;
  if (scene.textures.exists(textureKey)) return textureKey;

  const gfx = scene.add.graphics();

  switch (charDef.id) {
    case 'pinki': drawPinki(gfx); break;
    case 'mr-black': drawMrBlack(gfx); break;
    case 'oren': drawOren(gfx); break;
    case 'wenda': drawWenda(gfx); break;
    case 'mr-tree': drawMrTree(gfx); break;
    case 'mr-sun': drawMrSun(gfx); break;
    case 'simon': drawSimon(gfx); break;
    case 'jevin': drawJevin(gfx); break;
    case 'sky': drawSky(gfx); break;
    case 'mr-fun-computer': drawMrFunComputer(gfx); break;
    case 'durple': drawDurple(gfx); break;
    case 'owakcx': drawOwakcx(gfx); break;
    case 'raddy': drawRaddy(gfx); break;
    case 'fun-bot': drawFunBot(gfx); break;
    case 'vineria': drawVineria(gfx); break;
    case 'gray': drawGray(gfx); break;
    default: drawGeneric(gfx, charDef.bodyColor); break;
  }

  gfx.generateTexture(textureKey, W, H);
  gfx.destroy();
  return textureKey;
}

// -- Shared helpers --

function blob(gfx: Phaser.GameObjects.Graphics, color: number, cx: number, cy: number, rx: number, ry: number) {
  gfx.fillStyle(color);
  gfx.fillEllipse(cx, cy, rx * 2, ry * 2);
  // Highlight
  gfx.fillStyle(0xffffff, 0.12);
  gfx.fillEllipse(cx - rx * 0.2, cy - ry * 0.25, rx * 0.7, ry * 0.8);
}

function eyes(gfx: Phaser.GameObjects.Graphics, cx: number, cy: number, style: 'normal' | 'wide' | 'hidden' | 'inverted' | 'mismatched' = 'normal') {
  const ey = cy - 2;
  const sep = 9;
  switch (style) {
    case 'hidden':
      // White eyes only (for dark characters)
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(cx - sep, ey, 9, 11);
      gfx.fillEllipse(cx + sep, ey, 9, 11);
      gfx.fillStyle(0x111111);
      gfx.fillCircle(cx - sep + 1, ey + 1, 3);
      gfx.fillCircle(cx + sep + 1, ey + 1, 3);
      break;
    case 'inverted':
      gfx.fillStyle(0x222222);
      gfx.fillEllipse(cx - sep, ey, 10, 12);
      gfx.fillEllipse(cx + sep, ey, 10, 12);
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(cx - sep + 1, ey + 1, 3.5);
      gfx.fillCircle(cx + sep + 1, ey + 1, 3.5);
      break;
    case 'mismatched':
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(cx - sep, ey, 10, 12);
      gfx.fillEllipse(cx + sep, ey, 10, 12);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(cx - sep + 1, ey + 1, 2); // small
      gfx.fillCircle(cx + sep + 1, ey + 1, 5); // big
      break;
    case 'wide':
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(cx - sep, ey, 11, 14);
      gfx.fillEllipse(cx + sep, ey, 11, 14);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(cx - sep + 1, ey + 1, 4);
      gfx.fillCircle(cx + sep + 1, ey + 1, 4);
      break;
    default:
      gfx.fillStyle(0xffffff);
      gfx.fillEllipse(cx - sep, ey, 10, 12);
      gfx.fillEllipse(cx + sep, ey, 10, 12);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(cx - sep + 1, ey + 1, 3.5);
      gfx.fillCircle(cx + sep + 1, ey + 1, 3.5);
      break;
  }
}

function halfClosedLids(gfx: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number) {
  const ey = cy - 4;
  gfx.fillStyle(color);
  gfx.fillRect(cx - 18, ey, 11, 4);
  gfx.fillRect(cx + 3, ey, 11, 4);
}

function eyelashes(gfx: Phaser.GameObjects.Graphics, cx: number, cy: number) {
  const ey = cy - 5;
  gfx.lineStyle(1.5, 0x333333);
  // Left
  gfx.lineBetween(cx - 17, ey, cx - 20, ey - 5);
  gfx.lineBetween(cx - 13, ey - 2, cx - 14, ey - 7);
  // Right
  gfx.lineBetween(cx + 17, ey, cx + 20, ey - 5);
  gfx.lineBetween(cx + 13, ey - 2, cx + 14, ey - 7);
}

function smile(gfx: Phaser.GameObjects.Graphics, cx: number, cy: number) {
  gfx.lineStyle(2, 0x333333, 0.7);
  gfx.beginPath();
  gfx.arc(cx, cy + 8, 6, 0.3, Math.PI - 0.3, false);
  gfx.strokePath();
}

// -- Individual character draw functions --

function drawPinki(gfx: Phaser.GameObjects.Graphics) {
  // Bunny ears
  gfx.fillStyle(0xff69b4);
  gfx.fillEllipse(CX - 12, CY - 38, 11, 30);
  gfx.fillEllipse(CX + 12, CY - 38, 11, 30);
  // Inner ear
  gfx.fillStyle(0xffb6c1);
  gfx.fillEllipse(CX - 12, CY - 36, 6, 20);
  gfx.fillEllipse(CX + 12, CY - 36, 6, 20);

  // Body
  blob(gfx, 0xff69b4, CX, CY, 20, 22);

  // Bow on head
  gfx.fillStyle(0xc2185b);
  gfx.fillTriangle(CX - 3, CY - 22, CX - 14, CY - 30, CX - 3, CY - 30);
  gfx.fillTriangle(CX + 3, CY - 22, CX + 14, CY - 30, CX + 3, CY - 30);
  gfx.fillCircle(CX, CY - 26, 3);

  // Eyes with eyelashes
  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0xd4559e);
  eyelashes(gfx, CX, CY);
  smile(gfx, CX, CY);
}

function drawMrBlack(gfx: Phaser.GameObjects.Graphics) {
  // Body - tall, pitch black
  blob(gfx, 0x111111, CX, CY, 18, 24);

  // Top hat
  gfx.fillStyle(0x0a0a0a);
  gfx.fillRect(CX - 16, CY - 30, 32, 5);
  gfx.fillRect(CX - 12, CY - 50, 24, 22);
  // Hat band
  gfx.fillStyle(0x333333);
  gfx.fillRect(CX - 12, CY - 32, 24, 3);

  // White tie
  gfx.fillStyle(0xffffff);
  gfx.fillRect(CX - 3, CY + 2, 6, 5);
  gfx.fillTriangle(CX - 5, CY + 7, CX + 5, CY + 7, CX, CY + 18);

  // Eyes - white on black
  eyes(gfx, CX, CY, 'hidden');
}

function drawOren(gfx: Phaser.GameObjects.Graphics) {
  // Antennae
  gfx.lineStyle(2, 0xd35400);
  gfx.lineBetween(CX - 5, CY - 24, CX - 8, CY - 42);
  gfx.lineBetween(CX + 5, CY - 24, CX + 8, CY - 42);
  gfx.fillStyle(0xd35400);
  gfx.fillCircle(CX - 8, CY - 44, 3);
  gfx.fillCircle(CX + 8, CY - 44, 3);

  // Body
  blob(gfx, 0xe67e22, CX, CY, 20, 22);

  // Headphones
  gfx.lineStyle(4, 0xd4a017);
  gfx.beginPath();
  gfx.arc(CX, CY - 10, 20, Math.PI + 0.2, -0.2, false);
  gfx.strokePath();
  // Ear cups
  gfx.fillStyle(0xd4a017);
  gfx.fillRoundedRect(CX - 24, CY - 10, 8, 14, 3);
  gfx.fillRoundedRect(CX + 16, CY - 10, 8, 14, 3);

  // Hair tuft
  gfx.fillStyle(0xd35400);
  gfx.fillTriangle(CX - 4, CY - 22, CX + 2, CY - 34, CX + 6, CY - 20);

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0xd4790e);
  smile(gfx, CX, CY);
}

function drawWenda(gfx: Phaser.GameObjects.Graphics) {
  // Cat ears
  gfx.fillStyle(0xecf0f1);
  gfx.fillTriangle(CX - 20, CY - 14, CX - 12, CY - 38, CX - 4, CY - 14);
  gfx.fillTriangle(CX + 20, CY - 14, CX + 12, CY - 38, CX + 4, CY - 14);
  // Inner ear
  gfx.fillStyle(0xffcccc);
  gfx.fillTriangle(CX - 17, CY - 16, CX - 12, CY - 32, CX - 7, CY - 16);
  gfx.fillTriangle(CX + 17, CY - 16, CX + 12, CY - 32, CX + 7, CY - 16);

  // Body
  blob(gfx, 0xecf0f1, CX, CY, 20, 22);

  // Cheek tufts
  gfx.fillStyle(0xdde4e6);
  gfx.fillEllipse(CX - 22, CY + 4, 12, 8);
  gfx.fillEllipse(CX + 22, CY + 4, 12, 8);

  // Inverted eyes
  eyes(gfx, CX, CY, 'inverted');
  eyelashes(gfx, CX, CY);
  smile(gfx, CX, CY);
}

function drawMrTree(gfx: Phaser.GameObjects.Graphics) {
  // Leaf clusters on top
  gfx.fillStyle(0x27ae60);
  gfx.fillEllipse(CX - 12, CY - 30, 18, 16);
  gfx.fillEllipse(CX + 12, CY - 30, 18, 16);
  gfx.fillEllipse(CX, CY - 38, 16, 16);
  gfx.fillEllipse(CX - 8, CY - 22, 14, 12);
  gfx.fillEllipse(CX + 8, CY - 22, 14, 12);
  // Darker leaf detail
  gfx.fillStyle(0x1e8449);
  gfx.fillEllipse(CX - 6, CY - 34, 8, 8);
  gfx.fillEllipse(CX + 10, CY - 26, 6, 6);

  // Tree trunk body
  gfx.fillStyle(0x8B4513);
  gfx.fillRoundedRect(CX - 14, CY - 12, 28, 34, 6);
  // Bark detail
  gfx.fillStyle(0x6d3710, 0.4);
  gfx.fillRect(CX - 6, CY - 4, 3, 16);
  gfx.fillRect(CX + 4, CY + 2, 2, 12);

  // Branch
  gfx.lineStyle(3, 0x8B4513);
  gfx.lineBetween(CX - 14, CY - 2, CX - 24, CY - 10);
  gfx.fillStyle(0x27ae60);
  gfx.fillCircle(CX - 26, CY - 12, 5);

  // Face on trunk
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(CX - 5, CY + 4, 4);
  gfx.fillCircle(CX + 7, CY + 2, 5);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(CX - 4, CY + 5, 2);
  gfx.fillCircle(CX + 8, CY + 3, 2.5);
  smile(gfx, CX, CY + 6);
}

function drawMrSun(gfx: Phaser.GameObjects.Graphics) {
  // Sun rays
  gfx.fillStyle(0xe67e22);
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const rx = CX + Math.cos(angle) * 28;
    const ry = CY + Math.sin(angle) * 28;
    gfx.fillTriangle(
      rx + Math.cos(angle) * 12, ry + Math.sin(angle) * 12,
      rx + Math.cos(angle + 0.4) * 4, ry + Math.sin(angle + 0.4) * 4,
      rx + Math.cos(angle - 0.4) * 4, ry + Math.sin(angle - 0.4) * 4,
    );
  }

  // Sun body - bright yellow circle
  gfx.fillStyle(0xf1c40f);
  gfx.fillCircle(CX, CY, 24);
  // Inner glow
  gfx.fillStyle(0xf9e547, 0.5);
  gfx.fillCircle(CX - 4, CY - 4, 14);

  // Simple happy face
  gfx.fillStyle(0x000000);
  gfx.fillCircle(CX - 8, CY - 4, 3);
  gfx.fillCircle(CX + 8, CY - 4, 3);
  // Big smile
  gfx.lineStyle(2.5, 0x000000);
  gfx.beginPath();
  gfx.arc(CX, CY + 4, 10, 0.2, Math.PI - 0.2, false);
  gfx.strokePath();
}

function drawSimon(gfx: Phaser.GameObjects.Graphics) {
  // Cone horns on sides
  gfx.fillStyle(0xe67e22);
  gfx.fillTriangle(CX - 22, CY - 6, CX - 28, CY - 22, CX - 14, CY - 10);
  gfx.fillTriangle(CX + 22, CY - 6, CX + 28, CY - 22, CX + 14, CY - 10);

  // Antennae with spheres
  gfx.lineStyle(2, 0xf39c12);
  gfx.lineBetween(CX - 7, CY - 24, CX - 10, CY - 44);
  gfx.lineBetween(CX + 7, CY - 24, CX + 10, CY - 44);
  gfx.fillStyle(0xf1c40f);
  gfx.fillCircle(CX - 10, CY - 46, 5);
  gfx.fillCircle(CX + 10, CY - 46, 5);

  // Body
  blob(gfx, 0xf39c12, CX, CY, 20, 22);

  // Hair tuft
  gfx.fillStyle(0xe67e22);
  gfx.fillTriangle(CX - 6, CY - 22, CX, CY - 36, CX + 8, CY - 20);

  eyes(gfx, CX, CY, 'wide');
  smile(gfx, CX, CY);
}

function drawJevin(gfx: Phaser.GameObjects.Graphics) {
  // Hood/cloak behind body
  gfx.fillStyle(0x1a2550);
  gfx.fillEllipse(CX, CY + 2, 44, 48);
  // Hood peak
  gfx.fillTriangle(CX - 10, CY - 22, CX, CY - 40, CX + 10, CY - 22);

  // Body (mostly hidden by cloak)
  blob(gfx, 0x2c3e7a, CX, CY, 18, 20);

  // Pointed ears peeking out
  gfx.fillStyle(0x2c3e7a);
  gfx.fillTriangle(CX - 22, CY - 6, CX - 28, CY - 16, CX - 16, CY - 10);
  gfx.fillTriangle(CX + 22, CY - 6, CX + 28, CY - 16, CX + 16, CY - 10);

  // Belt
  gfx.fillStyle(0x4a6fa5);
  gfx.fillRect(CX - 16, CY + 10, 32, 4);

  // Face partially shadowed
  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0x1e3060);
  // Subtle frown
  gfx.lineStyle(2, 0x333333, 0.5);
  gfx.beginPath();
  gfx.arc(CX, CY + 14, 5, Math.PI + 0.3, -0.3, false);
  gfx.strokePath();
}

function drawSky(gfx: Phaser.GameObjects.Graphics) {
  // Round bear ears
  gfx.fillStyle(0x5dade2);
  gfx.fillCircle(CX - 18, CY - 22, 10);
  gfx.fillCircle(CX + 18, CY - 22, 10);
  // Inner ear
  gfx.fillStyle(0x3498db);
  gfx.fillCircle(CX - 18, CY - 22, 5);
  gfx.fillCircle(CX + 18, CY - 22, 5);

  // Body
  blob(gfx, 0x5dade2, CX, CY, 20, 22);

  // Cowlick
  gfx.fillStyle(0x3498db);
  gfx.fillTriangle(CX + 2, CY - 22, CX + 7, CY - 40, CX + 12, CY - 22);

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0x4a9ac7);
  smile(gfx, CX, CY);
}

function drawMrFunComputer(gfx: Phaser.GameObjects.Graphics) {
  // Desk
  gfx.fillStyle(0x8B4513);
  gfx.fillRect(CX - 22, CY + 16, 44, 6);

  // Monitor body
  gfx.fillStyle(0xbdc3c7);
  gfx.fillRoundedRect(CX - 18, CY - 18, 36, 32, 3);
  // Monitor bezel
  gfx.fillStyle(0x95a5a6);
  gfx.fillRect(CX - 18, CY + 10, 36, 4);

  // Screen
  gfx.fillStyle(0x1a1a2e);
  gfx.fillRoundedRect(CX - 15, CY - 15, 30, 22, 2);

  // Face on screen
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(CX - 6, CY - 6, 3);
  gfx.fillCircle(CX + 6, CY - 6, 3);
  // Zigzag blush
  gfx.lineStyle(1, 0xffffff, 0.6);
  gfx.lineBetween(CX - 12, CY, CX - 10, CY - 2);
  gfx.lineBetween(CX - 10, CY - 2, CX - 8, CY);
  gfx.lineBetween(CX + 8, CY, CX + 10, CY - 2);
  gfx.lineBetween(CX + 10, CY - 2, CX + 12, CY);
  // Smile
  gfx.lineStyle(1.5, 0xffffff, 0.8);
  gfx.beginPath();
  gfx.arc(CX, CY + 2, 5, 0.3, Math.PI - 0.3, false);
  gfx.strokePath();

  // Monitor stand
  gfx.fillStyle(0x95a5a6);
  gfx.fillRect(CX - 4, CY + 14, 8, 4);

  // Propeller beanie on top
  gfx.fillStyle(0xe74c3c);
  gfx.fillRect(CX - 10, CY - 22, 20, 5);
  // Propeller blades
  const propColors = [0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71];
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI * 2 * i) / 4;
    gfx.fillStyle(propColors[i]);
    gfx.fillEllipse(CX + Math.cos(a) * 8, CY - 26 + Math.sin(a) * 2, 7, 3);
  }
  // Center pin
  gfx.fillStyle(0xf1c40f);
  gfx.fillCircle(CX, CY - 24, 2);

  // Power plug trailing
  gfx.lineStyle(2, 0x333333);
  gfx.lineBetween(CX + 18, CY + 8, CX + 26, CY + 16);
  gfx.lineBetween(CX + 26, CY + 16, CX + 28, CY + 22);
}

function drawDurple(gfx: Phaser.GameObjects.Graphics) {
  // Dragon horns
  gfx.fillStyle(0x7d3c98);
  gfx.fillTriangle(CX - 12, CY - 18, CX - 10, CY - 44, CX - 6, CY - 18);
  gfx.fillTriangle(CX + 12, CY - 18, CX + 10, CY - 44, CX + 6, CY - 18);

  // Fin ears
  gfx.fillStyle(0x7d3c98);
  gfx.fillTriangle(CX - 22, CY - 4, CX - 30, CY - 16, CX - 16, CY - 10);
  gfx.fillTriangle(CX + 22, CY - 4, CX + 30, CY - 16, CX + 16, CY - 10);

  // Body
  blob(gfx, 0x9b59b6, CX, CY, 20, 22);

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0x8646a0);
  smile(gfx, CX, CY);
}

function drawOwakcx(gfx: Phaser.GameObjects.Graphics) {
  // 5 spiky hair tufts
  gfx.fillStyle(0x6abf1d);
  const spikes = [-12, -6, 0, 6, 12];
  const heights = [14, 18, 22, 18, 14];
  for (let i = 0; i < 5; i++) {
    gfx.fillTriangle(
      CX + spikes[i] - 4, CY - 20,
      CX + spikes[i], CY - 20 - heights[i],
      CX + spikes[i] + 4, CY - 20
    );
  }

  // Body
  blob(gfx, 0x7ddf2d, CX, CY, 20, 22);

  // Mismatched eyes + frazzled expression
  eyes(gfx, CX, CY, 'mismatched');
  // Eye bags
  gfx.lineStyle(1, 0x5ca820, 0.5);
  gfx.beginPath();
  gfx.arc(CX - 9, CY + 4, 4, 0, Math.PI, false);
  gfx.strokePath();
  gfx.beginPath();
  gfx.arc(CX + 9, CY + 4, 4, 0, Math.PI, false);
  gfx.strokePath();

  // Worried/frazzled mouth showing teeth
  gfx.lineStyle(2, 0x333333, 0.7);
  gfx.beginPath();
  gfx.arc(CX, CY + 12, 6, Math.PI + 0.3, -0.3, false);
  gfx.strokePath();
  // Teeth
  gfx.fillStyle(0xffffff);
  gfx.fillRect(CX - 4, CY + 7, 3, 3);
  gfx.fillRect(CX + 1, CY + 7, 3, 3);
}

function drawRaddy(gfx: Phaser.GameObjects.Graphics) {
  // Pointy ears
  gfx.fillStyle(0xc0392b);
  gfx.fillTriangle(CX - 22, CY - 4, CX - 28, CY - 20, CX - 14, CY - 10);
  gfx.fillTriangle(CX + 22, CY - 4, CX + 28, CY - 20, CX + 14, CY - 10);

  // Body
  blob(gfx, 0xe74c3c, CX, CY, 20, 22);

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0xc43a31);
  smile(gfx, CX, CY);
}

function drawFunBot(gfx: Phaser.GameObjects.Graphics) {
  // Antenna
  gfx.lineStyle(3, 0xf1c40f);
  gfx.lineBetween(CX, CY - 24, CX, CY - 44);
  gfx.fillStyle(0xf1c40f);
  gfx.fillCircle(CX, CY - 46, 5);

  // Body
  blob(gfx, 0xf5f0dc, CX, CY, 20, 22);

  // Yellow mask over face area
  gfx.fillStyle(0xf1c40f, 0.85);
  gfx.fillEllipse(CX, CY - 2, 30, 18);

  // Eyes on mask
  gfx.fillStyle(0xffffff);
  gfx.fillEllipse(CX - 9, CY - 4, 10, 12);
  gfx.fillEllipse(CX + 9, CY - 4, 10, 12);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(CX - 8, CY - 3, 3.5);
  gfx.fillCircle(CX + 10, CY - 3, 3.5);

  smile(gfx, CX, CY);
}

function drawVineria(gfx: Phaser.GameObjects.Graphics) {
  // Body
  blob(gfx, 0x58d68d, CX, CY, 20, 22);

  // Flowers in hair
  const flowerPositions = [
    { x: CX - 14, y: CY - 24 },
    { x: CX, y: CY - 28 },
    { x: CX + 14, y: CY - 24 },
  ];
  const petalColors = [0xff69b4, 0xff6347, 0xff85c1];
  for (let fi = 0; fi < 3; fi++) {
    const fp = flowerPositions[fi];
    // Stem/leaf
    gfx.fillStyle(0x3daa6d);
    gfx.fillEllipse(fp.x, fp.y + 6, 4, 8);
    // Petals
    gfx.fillStyle(petalColors[fi]);
    for (let p = 0; p < 5; p++) {
      const pa = (Math.PI * 2 * p) / 5 - Math.PI / 2;
      gfx.fillEllipse(fp.x + Math.cos(pa) * 4, fp.y + Math.sin(pa) * 4, 4, 4);
    }
    // Center
    gfx.fillStyle(0xf1c40f);
    gfx.fillCircle(fp.x, fp.y, 2.5);
  }

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0x48b578);
  eyelashes(gfx, CX, CY);
  smile(gfx, CX, CY);
}

function drawGray(gfx: Phaser.GameObjects.Graphics) {
  // Pointy ears
  gfx.fillStyle(0x7f8c8d);
  gfx.fillTriangle(CX - 20, CY - 8, CX - 26, CY - 24, CX - 12, CY - 12);
  gfx.fillTriangle(CX + 20, CY - 8, CX + 26, CY - 24, CX + 12, CY - 12);

  // Body
  blob(gfx, 0x95a5a6, CX, CY, 20, 22);

  // 2 smooth spiky hair tufts
  gfx.fillStyle(0x7f8c8d);
  gfx.fillTriangle(CX - 6, CY - 22, CX - 2, CY - 38, CX + 2, CY - 22);
  gfx.fillTriangle(CX + 6, CY - 20, CX + 10, CY - 34, CX + 14, CY - 20);

  eyes(gfx, CX, CY);
  halfClosedLids(gfx, CX, CY, 0x838e8f);

  // Freckles
  gfx.fillStyle(0x7f8c8d);
  gfx.fillCircle(CX - 14, CY + 4, 2);
  gfx.fillCircle(CX - 10, CY + 7, 2);
  gfx.fillCircle(CX - 17, CY + 7, 1.5);
  gfx.fillCircle(CX + 14, CY + 4, 2);
  gfx.fillCircle(CX + 10, CY + 7, 2);
  gfx.fillCircle(CX + 17, CY + 7, 1.5);

  smile(gfx, CX, CY);
}

function drawGeneric(gfx: Phaser.GameObjects.Graphics, color: number) {
  blob(gfx, color, CX, CY, 20, 22);
  eyes(gfx, CX, CY);
  smile(gfx, CX, CY);
}

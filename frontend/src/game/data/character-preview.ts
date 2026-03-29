const cache = new Map<string, string>();

const W = 80;
const H = 96;
const CX = W / 2;
const CY = H / 2 + 8;

export function getCharacterPreview(id: string): string {
  if (cache.has(id)) return cache.get(id)!;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  switch (id) {
    case 'pinki': drawPinki(ctx); break;
    case 'mr-black': drawMrBlack(ctx); break;
    case 'oren': drawOren(ctx); break;
    case 'wenda': drawWenda(ctx); break;
    case 'mr-tree': drawMrTree(ctx); break;
    case 'mr-sun': drawMrSun(ctx); break;
    case 'simon': drawSimon(ctx); break;
    case 'jevin': drawJevin(ctx); break;
    case 'sky': drawSky(ctx); break;
    case 'mr-fun-computer': drawMrFunComputer(ctx); break;
    case 'durple': drawDurple(ctx); break;
    case 'owakcx': drawOwakcx(ctx); break;
    case 'raddy': drawRaddy(ctx); break;
    case 'fun-bot': drawFunBot(ctx); break;
    case 'vineria': drawVineria(ctx); break;
    case 'gray': drawGray(ctx); break;
    default: drawBlob(ctx, '#ff69b4'); break;
  }

  const url = canvas.toDataURL();
  cache.set(id, url);
  return url;
}

// -- Helpers --

function blob(ctx: CanvasRenderingContext2D, color: string, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.2, cy - ry * 0.25, rx * 0.35, ry * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(ctx: CanvasRenderingContext2D, cx: number, cy: number, style: string = 'normal') {
  const ey = cy - 2;
  const sep = 9;
  switch (style) {
    case 'hidden':
      ctx.fillStyle = '#ffffff';
      ellipse(ctx, cx - sep, ey, 4.5, 5.5);
      ellipse(ctx, cx + sep, ey, 4.5, 5.5);
      ctx.fillStyle = '#111111';
      circle(ctx, cx - sep + 1, ey + 1, 3);
      circle(ctx, cx + sep + 1, ey + 1, 3);
      break;
    case 'inverted':
      ctx.fillStyle = '#222222';
      ellipse(ctx, cx - sep, ey, 5, 6);
      ellipse(ctx, cx + sep, ey, 5, 6);
      ctx.fillStyle = '#ffffff';
      circle(ctx, cx - sep + 1, ey + 1, 3.5);
      circle(ctx, cx + sep + 1, ey + 1, 3.5);
      break;
    case 'mismatched':
      ctx.fillStyle = '#ffffff';
      ellipse(ctx, cx - sep, ey, 5, 6);
      ellipse(ctx, cx + sep, ey, 5, 6);
      ctx.fillStyle = '#000000';
      circle(ctx, cx - sep + 1, ey + 1, 2);
      circle(ctx, cx + sep + 1, ey + 1, 5);
      break;
    case 'wide':
      ctx.fillStyle = '#ffffff';
      ellipse(ctx, cx - sep, ey, 5.5, 7);
      ellipse(ctx, cx + sep, ey, 5.5, 7);
      ctx.fillStyle = '#000000';
      circle(ctx, cx - sep + 1, ey + 1, 4);
      circle(ctx, cx + sep + 1, ey + 1, 4);
      break;
    default:
      ctx.fillStyle = '#ffffff';
      ellipse(ctx, cx - sep, ey, 5, 6);
      ellipse(ctx, cx + sep, ey, 5, 6);
      ctx.fillStyle = '#000000';
      circle(ctx, cx - sep + 1, ey + 1, 3.5);
      circle(ctx, cx + sep + 1, ey + 1, 3.5);
      break;
  }
}

function halfLids(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 18, cy - 4, 11, 4);
  ctx.fillRect(cx + 3, cy - 4, 11, 4);
}

function drawEyelashes(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const ey = cy - 5;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;
  line(ctx, cx - 17, ey, cx - 20, ey - 5);
  line(ctx, cx - 13, ey - 2, cx - 14, ey - 7);
  line(ctx, cx + 17, ey, cx + 20, ey - 5);
  line(ctx, cx + 13, ey - 2, cx + 14, ey - 7);
}

function drawSmile(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = 'rgba(51,51,51,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + 8, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
}

function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function tri(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// -- Characters --

function drawPinki(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ff69b4';
  ellipse(ctx, CX - 12, CY - 38, 5.5, 15);
  ellipse(ctx, CX + 12, CY - 38, 5.5, 15);
  ctx.fillStyle = '#ffb6c1';
  ellipse(ctx, CX - 12, CY - 36, 3, 10);
  ellipse(ctx, CX + 12, CY - 36, 3, 10);
  blob(ctx, '#ff69b4', CX, CY, 20, 22);
  ctx.fillStyle = '#c2185b';
  tri(ctx, CX - 3, CY - 22, CX - 14, CY - 30, CX - 3, CY - 30);
  tri(ctx, CX + 3, CY - 22, CX + 14, CY - 30, CX + 3, CY - 30);
  circle(ctx, CX, CY - 26, 3);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#d4559e');
  drawEyelashes(ctx, CX, CY);
  drawSmile(ctx, CX, CY);
}

function drawMrBlack(ctx: CanvasRenderingContext2D) {
  blob(ctx, '#111111', CX, CY, 18, 24);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(CX - 16, CY - 30, 32, 5);
  ctx.fillRect(CX - 12, CY - 50, 24, 22);
  ctx.fillStyle = '#333333';
  ctx.fillRect(CX - 12, CY - 32, 24, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(CX - 3, CY + 2, 6, 5);
  tri(ctx, CX - 5, CY + 7, CX + 5, CY + 7, CX, CY + 18);
  drawEyes(ctx, CX, CY, 'hidden');
}

function drawOren(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#d35400';
  ctx.lineWidth = 2;
  line(ctx, CX - 5, CY - 24, CX - 8, CY - 42);
  line(ctx, CX + 5, CY - 24, CX + 8, CY - 42);
  ctx.fillStyle = '#d35400';
  circle(ctx, CX - 8, CY - 44, 3);
  circle(ctx, CX + 8, CY - 44, 3);
  blob(ctx, '#e67e22', CX, CY, 20, 22);
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(CX, CY - 10, 20, Math.PI + 0.2, -0.2);
  ctx.stroke();
  ctx.fillStyle = '#d4a017';
  roundRect(ctx, CX - 24, CY - 10, 8, 14, 3);
  roundRect(ctx, CX + 16, CY - 10, 8, 14, 3);
  ctx.fillStyle = '#d35400';
  tri(ctx, CX - 4, CY - 22, CX + 2, CY - 34, CX + 6, CY - 20);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#d4790e');
  drawSmile(ctx, CX, CY);
}

function drawWenda(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ecf0f1';
  tri(ctx, CX - 20, CY - 14, CX - 12, CY - 38, CX - 4, CY - 14);
  tri(ctx, CX + 20, CY - 14, CX + 12, CY - 38, CX + 4, CY - 14);
  ctx.fillStyle = '#ffcccc';
  tri(ctx, CX - 17, CY - 16, CX - 12, CY - 32, CX - 7, CY - 16);
  tri(ctx, CX + 17, CY - 16, CX + 12, CY - 32, CX + 7, CY - 16);
  blob(ctx, '#ecf0f1', CX, CY, 20, 22);
  ctx.fillStyle = '#dde4e6';
  ellipse(ctx, CX - 22, CY + 4, 6, 4);
  ellipse(ctx, CX + 22, CY + 4, 6, 4);
  drawEyes(ctx, CX, CY, 'inverted');
  drawEyelashes(ctx, CX, CY);
  drawSmile(ctx, CX, CY);
}

function drawMrTree(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#27ae60';
  ellipse(ctx, CX - 12, CY - 30, 9, 8);
  ellipse(ctx, CX + 12, CY - 30, 9, 8);
  ellipse(ctx, CX, CY - 38, 8, 8);
  ellipse(ctx, CX - 8, CY - 22, 7, 6);
  ellipse(ctx, CX + 8, CY - 22, 7, 6);
  ctx.fillStyle = '#1e8449';
  ellipse(ctx, CX - 6, CY - 34, 4, 4);
  ellipse(ctx, CX + 10, CY - 26, 3, 3);
  ctx.fillStyle = '#8B4513';
  roundRect(ctx, CX - 14, CY - 12, 28, 34, 6);
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  line(ctx, CX - 14, CY - 2, CX - 24, CY - 10);
  ctx.fillStyle = '#27ae60';
  circle(ctx, CX - 26, CY - 12, 5);
  ctx.fillStyle = '#ffffff';
  circle(ctx, CX - 5, CY + 4, 4);
  circle(ctx, CX + 7, CY + 2, 5);
  ctx.fillStyle = '#000000';
  circle(ctx, CX - 4, CY + 5, 2);
  circle(ctx, CX + 8, CY + 3, 2.5);
  drawSmile(ctx, CX, CY + 6);
}

function drawMrSun(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#e67e22';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const rx = CX + Math.cos(a) * 28;
    const ry = CY + Math.sin(a) * 28;
    tri(ctx,
      rx + Math.cos(a) * 12, ry + Math.sin(a) * 12,
      rx + Math.cos(a + 0.4) * 4, ry + Math.sin(a + 0.4) * 4,
      rx + Math.cos(a - 0.4) * 4, ry + Math.sin(a - 0.4) * 4,
    );
  }
  ctx.fillStyle = '#f1c40f';
  circle(ctx, CX, CY, 24);
  ctx.fillStyle = 'rgba(249,229,71,0.5)';
  circle(ctx, CX - 4, CY - 4, 14);
  ctx.fillStyle = '#000000';
  circle(ctx, CX - 8, CY - 4, 3);
  circle(ctx, CX + 8, CY - 4, 3);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(CX, CY + 4, 10, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawSimon(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#e67e22';
  tri(ctx, CX - 22, CY - 6, CX - 28, CY - 22, CX - 14, CY - 10);
  tri(ctx, CX + 22, CY - 6, CX + 28, CY - 22, CX + 14, CY - 10);
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 2;
  line(ctx, CX - 7, CY - 24, CX - 10, CY - 44);
  line(ctx, CX + 7, CY - 24, CX + 10, CY - 44);
  ctx.fillStyle = '#f1c40f';
  circle(ctx, CX - 10, CY - 46, 5);
  circle(ctx, CX + 10, CY - 46, 5);
  blob(ctx, '#f39c12', CX, CY, 20, 22);
  ctx.fillStyle = '#e67e22';
  tri(ctx, CX - 6, CY - 22, CX, CY - 36, CX + 8, CY - 20);
  drawEyes(ctx, CX, CY, 'wide');
  drawSmile(ctx, CX, CY);
}

function drawJevin(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1a2550';
  ellipse(ctx, CX, CY + 2, 22, 24);
  tri(ctx, CX - 10, CY - 22, CX, CY - 40, CX + 10, CY - 22);
  blob(ctx, '#2c3e7a', CX, CY, 18, 20);
  ctx.fillStyle = '#2c3e7a';
  tri(ctx, CX - 22, CY - 6, CX - 28, CY - 16, CX - 16, CY - 10);
  tri(ctx, CX + 22, CY - 6, CX + 28, CY - 16, CX + 16, CY - 10);
  ctx.fillStyle = '#4a6fa5';
  ctx.fillRect(CX - 16, CY + 10, 32, 4);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#1e3060');
  ctx.strokeStyle = 'rgba(51,51,51,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CX, CY + 14, 5, Math.PI + 0.3, -0.3);
  ctx.stroke();
}

function drawSky(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#5dade2';
  circle(ctx, CX - 18, CY - 22, 10);
  circle(ctx, CX + 18, CY - 22, 10);
  ctx.fillStyle = '#3498db';
  circle(ctx, CX - 18, CY - 22, 5);
  circle(ctx, CX + 18, CY - 22, 5);
  blob(ctx, '#5dade2', CX, CY, 20, 22);
  ctx.fillStyle = '#3498db';
  tri(ctx, CX + 2, CY - 22, CX + 7, CY - 40, CX + 12, CY - 22);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#4a9ac7');
  drawSmile(ctx, CX, CY);
}

function drawMrFunComputer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(CX - 22, CY + 16, 44, 6);
  ctx.fillStyle = '#bdc3c7';
  roundRect(ctx, CX - 18, CY - 18, 36, 32, 3);
  ctx.fillStyle = '#95a5a6';
  ctx.fillRect(CX - 18, CY + 10, 36, 4);
  ctx.fillStyle = '#1a1a2e';
  roundRect(ctx, CX - 15, CY - 15, 30, 22, 2);
  ctx.fillStyle = '#ffffff';
  circle(ctx, CX - 6, CY - 6, 3);
  circle(ctx, CX + 6, CY - 6, 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  line(ctx, CX - 12, CY, CX - 10, CY - 2);
  line(ctx, CX - 10, CY - 2, CX - 8, CY);
  line(ctx, CX + 8, CY, CX + 10, CY - 2);
  line(ctx, CX + 10, CY - 2, CX + 12, CY);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(CX, CY + 2, 5, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.fillStyle = '#95a5a6';
  ctx.fillRect(CX - 4, CY + 14, 8, 4);
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(CX - 10, CY - 22, 20, 5);
  const propColors = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'];
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI * 2 * i) / 4;
    ctx.fillStyle = propColors[i];
    ellipse(ctx, CX + Math.cos(a) * 8, CY - 26 + Math.sin(a) * 2, 3.5, 1.5);
  }
  ctx.fillStyle = '#f1c40f';
  circle(ctx, CX, CY - 24, 2);
}

function drawDurple(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#7d3c98';
  tri(ctx, CX - 12, CY - 18, CX - 10, CY - 44, CX - 6, CY - 18);
  tri(ctx, CX + 12, CY - 18, CX + 10, CY - 44, CX + 6, CY - 18);
  tri(ctx, CX - 22, CY - 4, CX - 30, CY - 16, CX - 16, CY - 10);
  tri(ctx, CX + 22, CY - 4, CX + 30, CY - 16, CX + 16, CY - 10);
  blob(ctx, '#9b59b6', CX, CY, 20, 22);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#8646a0');
  drawSmile(ctx, CX, CY);
}

function drawOwakcx(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#6abf1d';
  const spikes = [-12, -6, 0, 6, 12];
  const heights = [14, 18, 22, 18, 14];
  for (let i = 0; i < 5; i++) {
    tri(ctx, CX + spikes[i] - 4, CY - 20, CX + spikes[i], CY - 20 - heights[i], CX + spikes[i] + 4, CY - 20);
  }
  blob(ctx, '#7ddf2d', CX, CY, 20, 22);
  drawEyes(ctx, CX, CY, 'mismatched');
  ctx.strokeStyle = 'rgba(92,168,32,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(CX - 9, CY + 4, 4, 0, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(CX + 9, CY + 4, 4, 0, Math.PI); ctx.stroke();
  ctx.strokeStyle = 'rgba(51,51,51,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(CX, CY + 12, 6, Math.PI + 0.3, -0.3); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(CX - 4, CY + 7, 3, 3);
  ctx.fillRect(CX + 1, CY + 7, 3, 3);
}

function drawRaddy(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#c0392b';
  tri(ctx, CX - 22, CY - 4, CX - 28, CY - 20, CX - 14, CY - 10);
  tri(ctx, CX + 22, CY - 4, CX + 28, CY - 20, CX + 14, CY - 10);
  blob(ctx, '#e74c3c', CX, CY, 20, 22);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#c43a31');
  drawSmile(ctx, CX, CY);
}

function drawFunBot(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 3;
  line(ctx, CX, CY - 24, CX, CY - 44);
  ctx.fillStyle = '#f1c40f';
  circle(ctx, CX, CY - 46, 5);
  blob(ctx, '#f5f0dc', CX, CY, 20, 22);
  ctx.fillStyle = 'rgba(241,196,15,0.85)';
  ellipse(ctx, CX, CY - 2, 15, 9);
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, CX - 9, CY - 4, 5, 6);
  ellipse(ctx, CX + 9, CY - 4, 5, 6);
  ctx.fillStyle = '#000000';
  circle(ctx, CX - 8, CY - 3, 3.5);
  circle(ctx, CX + 10, CY - 3, 3.5);
  drawSmile(ctx, CX, CY);
}

function drawVineria(ctx: CanvasRenderingContext2D) {
  blob(ctx, '#58d68d', CX, CY, 20, 22);
  const fps = [{ x: CX - 14, y: CY - 24 }, { x: CX, y: CY - 28 }, { x: CX + 14, y: CY - 24 }];
  const pcs = ['#ff69b4', '#ff6347', '#ff85c1'];
  for (let fi = 0; fi < 3; fi++) {
    const fp = fps[fi];
    ctx.fillStyle = '#3daa6d';
    ellipse(ctx, fp.x, fp.y + 6, 2, 4);
    ctx.fillStyle = pcs[fi];
    for (let p = 0; p < 5; p++) {
      const pa = (Math.PI * 2 * p) / 5 - Math.PI / 2;
      circle(ctx, fp.x + Math.cos(pa) * 4, fp.y + Math.sin(pa) * 4, 2.5);
    }
    ctx.fillStyle = '#f1c40f';
    circle(ctx, fp.x, fp.y, 2);
  }
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#48b578');
  drawEyelashes(ctx, CX, CY);
  drawSmile(ctx, CX, CY);
}

function drawGray(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#7f8c8d';
  tri(ctx, CX - 20, CY - 8, CX - 26, CY - 24, CX - 12, CY - 12);
  tri(ctx, CX + 20, CY - 8, CX + 26, CY - 24, CX + 12, CY - 12);
  blob(ctx, '#95a5a6', CX, CY, 20, 22);
  ctx.fillStyle = '#7f8c8d';
  tri(ctx, CX - 6, CY - 22, CX - 2, CY - 38, CX + 2, CY - 22);
  tri(ctx, CX + 6, CY - 20, CX + 10, CY - 34, CX + 14, CY - 20);
  drawEyes(ctx, CX, CY);
  halfLids(ctx, CX, CY, '#838e8f');
  ctx.fillStyle = '#7f8c8d';
  circle(ctx, CX - 14, CY + 4, 2);
  circle(ctx, CX - 10, CY + 7, 2);
  circle(ctx, CX - 17, CY + 7, 1.5);
  circle(ctx, CX + 14, CY + 4, 2);
  circle(ctx, CX + 10, CY + 7, 2);
  circle(ctx, CX + 17, CY + 7, 1.5);
  drawSmile(ctx, CX, CY);
}

function drawBlob(ctx: CanvasRenderingContext2D, color: string) {
  blob(ctx, color, CX, CY, 20, 22);
  drawEyes(ctx, CX, CY);
  drawSmile(ctx, CX, CY);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

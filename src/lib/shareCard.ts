export interface ShareCardOptions {
  code: string;
  cn: string;
  tagline: string;
  similarity?: number;
  exactCount?: number;
  suitGlyph: string;
  suitIsRed: boolean;
  url: string;
}

const W = 1080;
const H = 1440;

export async function generateShareCard(opts: ShareCardOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  await ensureFontsReady();

  paintFelt(ctx);
  paintCornerSuits(ctx);
  paintBrand(ctx);
  paintCard(ctx, opts);
  paintIdentity(ctx, opts);
  paintTagline(ctx, opts.tagline);
  paintStats(ctx, opts);
  paintFooter(ctx, opts.url);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('toBlob returned null'));
      else resolve(blob);
    }, 'image/png');
  });
}

async function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('bold 360px "Playfair Display"'),
      document.fonts.load('bold 96px "Noto Serif SC"'),
      document.fonts.load('bold 72px "JetBrains Mono"'),
      document.fonts.load('italic 34px "Noto Sans SC"'),
    ]);
    await document.fonts.ready;
  } catch {
    // fall through to fallback fonts
  }
}

function paintFelt(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, Math.max(W, H));
  g.addColorStop(0, '#0B6B3A');
  g.addColorStop(0.6, '#063D1F');
  g.addColorStop(1, '#042013');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function paintCornerSuits(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#F8F5ED';
  ctx.font = '300px "Playfair Display", "Noto Serif SC", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('♠', -30, -60);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('♣', W + 30, H + 40);
  ctx.restore();
}

function paintBrand(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 56px "JetBrains Mono", ui-monospace, monospace';
  const letters: [string, string][] = [
    ['T', '#D7263D'],
    ['H', '#F8F5ED'],
    ['T', '#D7263D'],
    ['I', '#F8F5ED'],
  ];
  let x = 80;
  const y = 130;
  for (const [ch, color] of letters) {
    ctx.fillStyle = color;
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + 6;
  }
  ctx.fillStyle = '#C8B98F';
  ctx.font = '24px "Inter", "Noto Sans SC", sans-serif';
  ctx.fillText('德扑人格测试', x + 12, y - 6);
}

function paintCard(ctx: CanvasRenderingContext2D, opts: ShareCardOptions) {
  const cardX = 290;
  const cardY = 220;
  const cardW = 500;
  const cardH = 620;
  const radius = 28;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#F8F5ED';
  roundRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  const suitColor = opts.suitIsRed ? '#D7263D' : '#0A0A0A';
  ctx.fillStyle = suitColor;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 340px "Playfair Display", "Noto Serif SC", serif';
  ctx.fillText(opts.suitGlyph, cardX + cardW / 2, cardY + cardH / 2 + 10);

  ctx.font = 'bold 54px "Playfair Display", "Noto Serif SC", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(opts.suitGlyph, cardX + 28, cardY + 28);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(opts.suitGlyph, cardX + cardW - 28, cardY + cardH - 28);
}

function paintIdentity(ctx: CanvasRenderingContext2D, opts: ShareCardOptions) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#F5C04A';
  ctx.font = 'bold 68px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(opts.code, W / 2, 880);

  ctx.fillStyle = '#F8F5ED';
  ctx.font = 'bold 104px "Playfair Display", "Noto Serif SC", serif';
  ctx.fillText(opts.cn, W / 2, 970);
}

function paintTagline(ctx: CanvasRenderingContext2D, tagline: string) {
  ctx.fillStyle = '#F8F5ED';
  ctx.font = 'italic 34px "Inter", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  wrapCJKText(ctx, `「${tagline}」`, W / 2, 1110, W - 200, 48);
}

function paintStats(ctx: CanvasRenderingContext2D, opts: ShareCardOptions) {
  if (opts.similarity === undefined) return;
  const parts: string[] = [`匹配度 ${opts.similarity}%`];
  if (opts.exactCount !== undefined) parts.push(`精准命中 ${opts.exactCount}/15`);
  ctx.fillStyle = '#C8B98F';
  ctx.font = '28px "Inter", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(parts.join('  ·  '), W / 2, 1260);
}

function paintFooter(ctx: CanvasRenderingContext2D, url: string) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#C8B98F';
  ctx.font = '22px "Inter", "Noto Sans SC", sans-serif';
  ctx.fillText('测测你的德扑人格', W / 2, 1340);

  ctx.fillStyle = '#F5C04A';
  ctx.font = 'bold 26px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(truncateUrl(ctx, url, W - 160), W / 2, 1380);
}

function truncateUrl(ctx: CanvasRenderingContext2D, url: string, maxWidth: number): string {
  if (ctx.measureText(url).width <= maxWidth) return url;
  let lo = 0;
  let hi = url.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const candidate = url.slice(0, mid) + '…';
    if (ctx.measureText(candidate).width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return url.slice(0, lo) + '…';
}

function wrapCJKText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = Array.from(text);
  let line = '';
  let curY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, curY);
      line = ch;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

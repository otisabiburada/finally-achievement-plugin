// Draws the shareable "achievement unlocked" image on a canvas in the panel
// (so the system's own fonts, including Chinese, are used) and returns a PNG
// data URL. Pure drawing: no Decky APIs here.
import { t } from "./i18n";

export type ShareCardData = {
  title: string;
  description: string;
  game: string;
  rarityText: string; // e.g. "3.2% of players", or ""
  tier: string | null;
  rare: boolean;
  dateText: string;
  icon: string | null; // data URIs
  art: string | null;
};

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const FONT = '"Motiva Sans", "Noto Sans", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "Segoe UI", Arial, sans-serif';

const TIER_COLORS: Record<string, string> = {
  ultra_rare: "#c58bff",
  rare: "#f5c542",
  uncommon: "#5cc8ff",
  common: "#aab4c0",
};

function loadImage(src: string | null): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    const timer = window.setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

// Wraps text to a width, breaking at spaces and, for text without spaces
// (Chinese, or one very long word), between characters. The last allowed line
// ends with an ellipsis when the text doesn't fit.
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const tokens = clean.includes(" ") ? clean.split(" ").flatMap((w, i, a) => (i < a.length - 1 ? [w + " "] : [w])) : Array.from(clean);
  const lines: string[] = [];
  let line = "";
  const push = () => {
    lines.push(line.trimEnd());
    line = "";
  };
  for (const raw of tokens) {
    let token = raw;
    // A single word wider than the line is split by character.
    while (ctx.measureText(token.trimEnd()).width > maxWidth) {
      const chars = Array.from(token);
      let fit = "";
      for (const ch of chars) {
        if (ctx.measureText(line + fit + ch).width > maxWidth) break;
        fit += ch;
      }
      if (!fit) fit = chars[0];
      line += fit;
      token = token.slice(fit.length);
      push();
      if (!token) break;
    }
    if (!token) continue;
    if (ctx.measureText((line + token).trimEnd()).width > maxWidth && line) push();
    line += token;
  }
  if (line.trim()) push();
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 0 && ctx.measureText(last + "...").width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = last.trimEnd() + "...";
    return kept;
  }
  return lines;
}

export async function renderShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  const [icon, art] = await Promise.all([loadImage(data.icon), loadImage(data.art)]);
  const accent = TIER_COLORS[data.tier || ""] || (data.rare ? TIER_COLORS.rare : "#6ea8ff");

  // Background: the game's art (cover-fit, darkened) or a plain dark gradient.
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, "#10151f");
  bg.addColorStop(1, "#1b2434");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  if (art && art.width > 0 && art.height > 0) {
    const scale = Math.max(CARD_WIDTH / art.width, CARD_HEIGHT / art.height);
    const w = art.width * scale;
    const h = art.height * scale;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(art, (CARD_WIDTH - w) / 2, (CARD_HEIGHT - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }
  const shade = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  shade.addColorStop(0, "rgba(8,10,16,0.82)");
  shade.addColorStop(1, "rgba(8,10,16,0.38)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Accent bar on the left edge.
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 12, CARD_HEIGHT);

  // Icon
  const iconSize = 260;
  const ix = 80;
  const iy = (CARD_HEIGHT - iconSize) / 2 - 10;
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 40;
  roundRect(ctx, ix, iy, iconSize, iconSize, 28);
  ctx.fillStyle = "#0b0e14";
  ctx.fill();
  ctx.restore();
  if (icon) {
    ctx.save();
    roundRect(ctx, ix, iy, iconSize, iconSize, 28);
    ctx.clip();
    ctx.drawImage(icon, ix, iy, iconSize, iconSize);
    ctx.restore();
  } else {
    ctx.fillStyle = accent;
    ctx.font = `bold 120px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", ix + iconSize / 2, iy + iconSize / 2);
  }
  roundRect(ctx, ix, iy, iconSize, iconSize, 28);
  ctx.lineWidth = 5;
  ctx.strokeStyle = accent;
  ctx.stroke();

  // Text column
  const tx = ix + iconSize + 64;
  const tw = CARD_WIDTH - tx - 70;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = accent;
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText(t("Achievement Unlocked").toUpperCase(), tx, 150);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 60px ${FONT}`;
  const titleLines = wrapText(ctx, data.title, tw, 2);
  let y = 225;
  for (const line of titleLines) {
    ctx.fillText(line, tx, y);
    y += 68;
  }

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `400 30px ${FONT}`;
  const descLines = wrapText(ctx, data.description, tw, titleLines.length > 1 ? 2 : 3);
  y += 6;
  for (const line of descLines) {
    ctx.fillText(line, tx, y);
    y += 42;
  }

  if (data.rarityText) {
    ctx.fillStyle = accent;
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText(data.rarityText, tx, Math.max(y + 24, 400));
  }

  // Footer: game name left, date right, plugin credit under.
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `600 32px ${FONT}`;
  const gameLines = wrapText(ctx, data.game, CARD_WIDTH - 80 - 80 - 300, 1);
  ctx.fillText(gameLines[0] || "", 80, CARD_HEIGHT - 70);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `400 26px ${FONT}`;
  ctx.fillText(data.dateText, CARD_WIDTH - 70, CARD_HEIGHT - 70);
  ctx.font = `400 20px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("Finally Achievement Plugin", CARD_WIDTH - 70, CARD_HEIGHT - 36);

  return canvas.toDataURL("image/png");
}

/**
 * Handwriting engine. Strokes are stored as vectors in fixed "pad units" so the same prescription renders
 * crisply at any screen size and in print: { tool: 'pen' | 'eraser', color, size, points: [[x, y], ...] }.
 */
/** Pad units: x and y are both measured in thousandths of the writing-area width. */
export const PAD = { width: 1000 };

export const COLORS = [
  { value: '#0f172a', label: 'Black' },
  { value: '#1d4ed8', label: 'Blue' },
  { value: '#b91c1c', label: 'Red' },
];

export const SIZES = [
  { value: 2.5, label: 'Fine' },
  { value: 4, label: 'Medium' },
  { value: 7, label: 'Bold' },
];

export const ERASER_SIZE = 28;

/** Draws one stroke smoothly (quadratic curves through midpoints). */
export function drawStroke(ctx, stroke, scale) {
  const points = stroke.points;
  if (!points.length) return;
  ctx.save();
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  tracePath(ctx, points, scale);
  ctx.restore();
}

function tracePath(ctx, points, scale) {
  const [x0, y0] = points[0];
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(x0 * scale, y0 * scale, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x0 * scale, y0 * scale);
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    ctx.quadraticCurveTo(x * scale, y * scale, ((x + nx) / 2) * scale, ((y + ny) / 2) * scale);
  }
  const [lx, ly] = points[points.length - 1];
  ctx.lineTo(lx * scale, ly * scale);
  ctx.stroke();
}

/** Clears the canvas and draws every stroke at the canvas's current pixel size. */
export function renderStrokes(canvas, strokes) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.width / PAD.width;
  strokes.forEach((stroke) => drawStroke(ctx, stroke, scale));
}

/** PNG image of the ink (transparent background) for an area of the given height/width ratio. */
export function inkToDataUrl(strokes, ratio, pixelWidth = 1500) {
  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = Math.round(pixelWidth * ratio);
  renderStrokes(canvas, strokes);
  return canvas.toDataURL('image/png');
}

export function parseStrokes(json) {
  try {
    const value = JSON.parse(json || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export const hasInk = (strokes) => strokes.some((stroke) => stroke.tool === 'pen');

import { filters, getFrame, getLayout } from './presets';
import type { CapturedPhoto, FilterId, FrameId, LayoutId } from '../types';

const FRAME_PADDING = 0.085;

interface CanvasOptions {
  photos: CapturedPhoto[];
  layoutId: LayoutId;
  frameId: FrameId;
  customText: string;
  eventName: string;
  dateText: string;
  filter: FilterId;
  scale?: number;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCenterCrop(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  let sw = image.width;
  let sh = image.height;
  let sx = 0;
  let sy = 0;

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function setFilter(ctx: CanvasRenderingContext2D, filter: FilterId) {
  ctx.filter = filters.find((item) => item.id === filter)?.css ?? 'none';
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = '#151113';
  const bars = [2, 1, 4, 1, 1, 3, 2, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2];
  const unit = width / bars.reduce((sum, bar) => sum + bar + 1, 0);
  let cursor = x;
  bars.forEach((bar, index) => {
    if (index % 2 === 0) ctx.fillRect(cursor, y, bar * unit, height);
    cursor += (bar + 1) * unit;
  });
}

function drawTeddy(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color = '#B88458') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - s * 0.24, y - s * 0.23, s * 0.2, 0, Math.PI * 2);
  ctx.arc(x + s * 0.24, y - s * 0.23, s * 0.2, 0, Math.PI * 2);
  ctx.arc(x, y, s * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F8F1E9';
  ctx.beginPath();
  ctx.arc(x - s * 0.12, y - s * 0.05, s * 0.04, 0, Math.PI * 2);
  ctx.arc(x + s * 0.12, y - s * 0.05, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4A0E1F';
  ctx.lineWidth = Math.max(2, s * 0.025);
  ctx.beginPath();
  ctx.arc(x, y + s * 0.08, s * 0.11, 0, Math.PI);
  ctx.stroke();
}

function drawFrameDecor(ctx: CanvasRenderingContext2D, frameId: FrameId, width: number, height: number, text: string, eventName: string, dateText: string) {
  const frame = getFrame(frameId);
  const pad = Math.round(Math.min(width, height) * 0.035);
  ctx.save();
  ctx.filter = 'none';
  ctx.lineJoin = 'round';

  if (frameId === 'movie-ticket') {
    ctx.fillStyle = '#4A0E1F';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#F8F1E9';
    ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);
    ctx.strokeStyle = '#C79A34';
    ctx.lineWidth = Math.max(6, width * 0.008);
    ctx.setLineDash([18, 16]);
    ctx.strokeRect(pad * 1.6, pad * 1.6, width - pad * 3.2, height - pad * 3.2);
    ctx.setLineDash([]);
    ctx.fillStyle = '#4A0E1F';
    ctx.font = `700 ${width * 0.052}px Georgia`;
    ctx.fillText('S Movie', pad * 2.2, pad * 3.3);
    ctx.font = `600 ${width * 0.023}px sans-serif`;
    ctx.fillText(`DATE ${dateText}   ROW P   SEAT 14`, pad * 2.2, height - pad * 2.2);
    drawBarcode(ctx, width - pad * 8, height - pad * 3.2, pad * 5.4, pad * 1.2);
  }

  if (frameId === 'the-1975') {
    ctx.fillStyle = '#EEE3D2';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#24211D';
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i += 1) ctx.strokeRect(pad + i * 4, pad + i * 4, width - (pad + i * 4) * 2, height - (pad + i * 4) * 2);
    ctx.fillStyle = '#24211D';
    ctx.font = `700 ${width * 0.055}px Georgia`;
    ctx.fillText('PIAGGYPHOTO DAILY', pad * 1.5, pad * 3.1);
    ctx.font = `${width * 0.022}px Georgia`;
    ctx.fillText('ROMANTIC EDITION · VINTAGE ALBUM SERIES · ' + dateText.toUpperCase(), pad * 1.5, height - pad * 1.7);
  }

  if (frameId === 'scrapbook-romantic') {
    ctx.fillStyle = '#F8F1E9';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#F4D7D7';
    ctx.beginPath();
    ctx.arc(width - pad * 2.4, pad * 2.2, pad * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B85B6A';
    ctx.font = `${width * 0.045}px Georgia`;
    ctx.fillText('kiss kiss ♥', pad * 1.4, height - pad * 2.2);
    drawTeddy(ctx, width - pad * 3, height - pad * 2.4, pad * 2.6);
    ctx.fillStyle = '#C79A34';
    ctx.font = `${width * 0.06}px serif`;
    ctx.fillText('✦', pad * 1.2, pad * 2.4);
    ctx.fillText('✶', width - pad * 4.7, pad * 4.3);
  }

  if (frameId === 'couple-instagram') {
    ctx.fillStyle = '#FBEFF1';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    roundedRect(ctx, pad, pad, width - pad * 2, pad * 2.7, pad);
    ctx.fill();
    ctx.fillStyle = '#4A0E1F';
    ctx.font = `700 ${width * 0.032}px sans-serif`;
    ctx.fillText('MoraPix  •  PIAGGYPHOTO', pad * 1.7, pad * 2.05);
    ctx.fillStyle = '#FFFFFF';
    roundedRect(ctx, pad * 1.2, height - pad * 3.5, width * 0.6, pad * 2.2, pad);
    ctx.fill();
    ctx.fillStyle = '#4A0E1F';
    ctx.font = `${width * 0.026}px sans-serif`;
    ctx.fillText('best day ever with you', pad * 1.8, height - pad * 2.15);
  }

  if (frameId === 'vintage-postcard') {
    ctx.fillStyle = '#E9D6BE';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#9E6A3C';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad * 1.4, pad * 1.4, width - pad * 2.8, height - pad * 2.8);
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(width - pad * 5.8, pad * 1.8, pad * 3.8, pad * 3.2);
    ctx.setLineDash([]);
    ctx.fillStyle = '#9E6A3C';
    ctx.font = `700 ${width * 0.043}px Georgia`;
    ctx.fillText('POSTCARD', pad * 1.8, pad * 3);
    drawTeddy(ctx, width - pad * 3.7, pad * 3.3, pad * 2.1, '#9E6A3C');
  }

  if (frameId === 'pixelbooth-day') {
    ctx.fillStyle = '#B11226';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#F8F1E9';
    ctx.fillRect(pad * 1.2, pad * 1.2, width - pad * 2.4, height - pad * 2.4);
    ctx.strokeStyle = '#B11226';
    ctx.lineWidth = Math.max(8, width * 0.012);
    ctx.strokeRect(pad * 1.9, pad * 1.9, width - pad * 3.8, height - pad * 3.8);
    ctx.fillStyle = '#B11226';
    ctx.font = `700 ${width * 0.047}px sans-serif`;
    ctx.fillText('SPECIAL DAY', pad * 2.5, pad * 3.55);
    drawBarcode(ctx, width - pad * 8, height - pad * 3.4, pad * 5.8, pad * 1.2);
  }

  if (frameId === 'polaroid-collage') {
    ctx.fillStyle = '#FFF8F3';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#E9A9B4';
    for (let x = 0; x < width; x += pad * 1.4) {
      for (let y = 0; y < height; y += pad * 1.4) {
        if ((x + y) % Math.round(pad * 2.8) === 0) ctx.fillRect(x, y, pad * 0.7, pad * 0.7);
      }
    }
    ctx.fillStyle = '#C8415D';
    ctx.font = `${width * 0.055}px serif`;
    ctx.fillText('♡', pad * 1.5, pad * 2.4);
    ctx.fillText('🐞', width - pad * 3.8, height - pad * 2.3);
    ctx.fillStyle = '#C8415D';
    roundedRect(ctx, width * 0.35, pad * 0.7, width * 0.3, pad * 1.5, pad * 0.35);
    ctx.fill();
  }

  ctx.fillStyle = frameId === 'pixelbooth-day' ? '#B11226' : frame.accent;
  ctx.font = `700 ${Math.max(24, width * 0.036)}px Georgia`;
  ctx.textAlign = 'center';
  ctx.fillText(eventName || 'PIAGGYPHOTO', width / 2, height - pad * 1.15);
  ctx.font = `${Math.max(16, width * 0.022)}px sans-serif`;
  ctx.fillText(text || 'Luxury photobooth memories', width / 2, height - pad * 0.45);
  ctx.restore();
}

function photoCells(width: number, height: number, layoutId: LayoutId) {
  const layout = getLayout(layoutId);
  const pad = Math.min(width, height) * FRAME_PADDING;
  const topExtra = Math.min(width, height) * 0.08;
  const bottomExtra = Math.min(width, height) * 0.095;
  const gap = Math.min(width, height) * 0.025;
  const areaX = pad;
  const areaY = pad + topExtra;
  const areaW = width - pad * 2;
  const areaH = height - pad * 2 - topExtra - bottomExtra;
  const cellW = (areaW - gap * (layout.columns - 1)) / layout.columns;
  const cellH = (areaH - gap * (layout.rows - 1)) / layout.rows;

  return Array.from({ length: layout.slots }, (_, index) => {
    const col = index % layout.columns;
    const row = Math.floor(index / layout.columns);
    return { x: areaX + col * (cellW + gap), y: areaY + row * (cellH + gap), width: cellW, height: cellH };
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderPhotoboothCanvas(options: CanvasOptions) {
  const layout = getLayout(options.layoutId);
  const baseWidth = Math.round((options.scale ?? 1) * 1800);
  const width = layout.aspectRatio >= 1 ? baseWidth : Math.round(baseWidth * layout.aspectRatio);
  const height = layout.aspectRatio >= 1 ? Math.round(baseWidth / layout.aspectRatio) : baseWidth;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak tersedia di browser ini.');

  drawFrameDecor(ctx, options.frameId, width, height, options.customText, options.eventName, options.dateText);

  const images = await Promise.all(options.photos.map((photo) => loadImage(photo.dataUrl)));
  const cells = photoCells(width, height, options.layoutId);
  cells.forEach((cell, index) => {
    const image = images[index % images.length];
    ctx.save();
    roundedRect(ctx, cell.x, cell.y, cell.width, cell.height, Math.min(width, height) * 0.025);
    ctx.clip();
    ctx.fillStyle = '#151113';
    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    if (image) {
      setFilter(ctx, options.filter);
      drawCenterCrop(ctx, image, cell.x, cell.y, cell.width, cell.height);
    }
    ctx.restore();
    ctx.save();
    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = Math.max(4, width * 0.004);
    roundedRect(ctx, cell.x, cell.y, cell.width, cell.height, Math.min(width, height) * 0.025);
    ctx.stroke();
    ctx.restore();
  });

  drawFrameDecor(ctx, options.frameId, width, height, options.customText, options.eventName, options.dateText);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename = 'piaggyphoto.jpg') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.94);
  link.click();
}

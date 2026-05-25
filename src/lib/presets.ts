import type { FilterId, FramePreset, LayoutOption } from '../types';

export const layouts: LayoutOption[] = [
  { id: 'strip3', name: '3 Foto Vertical', description: 'Classic premium strip', slots: 3, columns: 1, rows: 3, aspectRatio: 0.42, printSize: '2 x 6 in' },
  { id: 'horizontal4', name: '4 Foto Horizontal', description: 'Mall booth landscape', slots: 4, columns: 4, rows: 1, aspectRatio: 2.4, printSize: '6 x 2.5 in' },
  { id: 'grid2x2', name: '2x2 Grid', description: 'Square social ready', slots: 4, columns: 2, rows: 2, aspectRatio: 1, printSize: '4 x 4 in' },
  { id: 'grid2x3', name: '2x3 Grid', description: 'Six-photo event card', slots: 6, columns: 2, rows: 3, aspectRatio: 0.72, printSize: '4 x 6 in' },
  { id: 'strip2x6', name: '2x6 Photostrip', description: 'Long double strip', slots: 12, columns: 2, rows: 6, aspectRatio: 0.55, printSize: '2 x 8 in' }
];

export const frames: FramePreset[] = [
  { id: 'movie-ticket', name: 'S Movie Ticket', reference: 'referensi1.jpg', tagline: 'Row A · Seat 14 · Admit Two', accent: '#C79A34' },
  { id: 'the-1975', name: 'The 1975 Aesthetic', reference: 'referensi5.png', tagline: 'Vintage newspaper / album cover', accent: '#24211D' },
  { id: 'scrapbook-romantic', name: 'Scrapbook Romantic', reference: 'referensi3.jpg', tagline: 'Pin, star, teddy, quote, lip marks', accent: '#B85B6A' },
  { id: 'couple-instagram', name: 'Couple Instagram', reference: 'referensi6.png', tagline: 'Chat UI + MoraPix inspired', accent: '#E8B4BC' },
  { id: 'vintage-postcard', name: 'Vintage Postcard', reference: 'referensi4.png', tagline: 'Envelope, stamp, teddy postcard', accent: '#9E6A3C' },
  { id: 'pixelbooth-day', name: 'Pixelbooth Special Day', reference: 'referensi2.jpg', tagline: 'Red ticket with barcode', accent: '#B11226' },
  { id: 'polaroid-collage', name: 'Polaroid Collage', reference: 'referensi7.png', tagline: 'Ribbon, gingham, ladybug details', accent: '#C8415D' }
];

export const filters: Array<{ id: FilterId; name: string; css: string }> = [
  { id: 'none', name: 'Natural', css: 'none' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(.28) contrast(.95) saturate(.9)' },
  { id: 'warm', name: 'Warm', css: 'sepia(.16) saturate(1.18) hue-rotate(-7deg)' },
  { id: 'bright', name: 'Bright', css: 'brightness(1.12) contrast(1.04)' },
  { id: 'bw', name: 'B&W', css: 'grayscale(1) contrast(1.08)' }
];

export function getLayout(id: string) {
  return layouts.find((layout) => layout.id === id) ?? layouts[0];
}

export function getFrame(id: string) {
  return frames.find((frame) => frame.id === id) ?? frames[0];
}

export function todayLabel() {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
}

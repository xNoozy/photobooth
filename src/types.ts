export type Screen = 'auth' | 'subscription' | 'start' | 'frame' | 'layout' | 'camera' | 'preview' | 'admin';

export type LayoutId = 'strip3' | 'horizontal4' | 'grid2x2' | 'grid2x3' | 'strip2x6';

export type FilterId = 'none' | 'vintage' | 'warm' | 'bright' | 'bw';

export type FrameId =
  | 'movie-ticket'
  | 'the-1975'
  | 'scrapbook-romantic'
  | 'couple-instagram'
  | 'vintage-postcard'
  | 'pixelbooth-day'
  | 'polaroid-collage';

export interface LayoutOption {
  id: LayoutId;
  name: string;
  description: string;
  slots: number;
  columns: number;
  rows: number;
  aspectRatio: number;
  printSize: string;
}

export interface FramePreset {
  id: FrameId;
  name: string;
  reference: string;
  tagline: string;
  accent: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  takenAt: string;
}

export interface RenderOptions {
  frameId: FrameId;
  layoutId: LayoutId;
  customText: string;
  eventName: string;
  dateText: string;
  filter: FilterId;
}

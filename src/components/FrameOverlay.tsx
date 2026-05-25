import { getFrame } from '../lib/presets';
import type { FrameId } from '../types';

interface FrameOverlayProps {
  frameId: FrameId;
  eventName: string;
  dateText: string;
  customText?: string;
  compact?: boolean;
}

export function FrameOverlay({ frameId, eventName, dateText, customText = 'Luxury photobooth memories', compact = false }: FrameOverlayProps) {
  const frame = getFrame(frameId);
  return (
    <div className={`frame-overlay frame-${frameId} ${compact ? 'compact' : ''}`} aria-hidden="true">
      <div className="frame-topline">
        <span>{frameId === 'movie-ticket' ? 'S Movie' : frameId === 'pixelbooth-day' ? 'SPECIAL DAY' : 'PIAGGYPHOTO'}</span>
        <small>{dateText}</small>
      </div>
      {frameId === 'couple-instagram' && <div className="chat-bubble">best day ever with you</div>}
      {frameId === 'vintage-postcard' && <div className="stamp">STAMP<br />♡</div>}
      {frameId === 'scrapbook-romantic' && <><span className="sticker star-a">✦</span><span className="sticker teddy">ʕ•ᴥ•ʔ</span><span className="lip">kiss</span></>}
      {frameId === 'polaroid-collage' && <><span className="ribbon" /><span className="ladybug">🐞</span></>}
      {frameId === 'the-1975' && <div className="newspaper-lines">VINTAGE ALBUM SERIES · LOVE EDITION · {dateText}</div>}
      {frameId === 'movie-ticket' && <div className="ticket-meta">ROW P · SEAT 14 · ADMIT TWO</div>}
      <div className="frame-footer" style={{ color: frame.accent }}>
        <strong>{eventName || 'PIAGGYPHOTO'}</strong>
        <span>{customText}</span>
      </div>
    </div>
  );
}

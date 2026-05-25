import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { filters, getLayout } from '../lib/presets';
import { downloadCanvas, renderPhotoboothCanvas } from '../lib/render';
import type { CapturedPhoto, FilterId, FrameId, LayoutId } from '../types';
import { FrameOverlay } from './FrameOverlay';

export interface PhotoRendererHandle {
  download: () => Promise<void>;
  renderCanvas: () => Promise<HTMLCanvasElement>;
}

interface PhotoRendererProps {
  photos: CapturedPhoto[];
  layoutId: LayoutId;
  frameId: FrameId;
  customText: string;
  eventName: string;
  dateText: string;
  filter: FilterId;
  onReorder?: (from: number, to: number) => void;
}

export const PhotoRenderer = forwardRef<PhotoRendererHandle, PhotoRendererProps>(function PhotoRenderer(props, ref) {
  const layout = getLayout(props.layoutId);
  const filterCss = filters.find((filter) => filter.id === props.filter)?.css ?? 'none';
  const slots = useMemo(() => Array.from({ length: layout.slots }, (_, index) => props.photos[index % Math.max(1, props.photos.length)]), [layout.slots, props.photos]);

  useImperativeHandle(ref, () => ({
    async renderCanvas() {
      return renderPhotoboothCanvas({ ...props, scale: 1.25 });
    },
    async download() {
      const canvas = await renderPhotoboothCanvas({ ...props, scale: 1.25 });
      downloadCanvas(canvas, `piaggyphoto-${props.layoutId}-${Date.now()}.jpg`);
    }
  }), [props]);

  return (
    <div className="renderer-shell" style={{ aspectRatio: String(layout.aspectRatio) }}>
      <div className="renderer-frame">
        <div
          className="photo-grid"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`
          }}
        >
          {slots.map((photo, index) => (
            <div
              key={`${photo?.id ?? 'empty'}-${index}`}
              className="photo-slot"
              draggable={Boolean(props.onReorder && photo)}
              onDragStart={(event) => event.dataTransfer.setData('slot', String(index))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const from = Number(event.dataTransfer.getData('slot'));
                if (Number.isFinite(from)) props.onReorder?.(from, index);
              }}
            >
              {photo ? <img src={photo.dataUrl} alt={`Captured ${index + 1}`} style={{ filter: filterCss }} /> : <span>Photo {index + 1}</span>}
            </div>
          ))}
        </div>
        <FrameOverlay frameId={props.frameId} eventName={props.eventName} dateText={props.dateText} customText={props.customText} />
      </div>
    </div>
  );
});

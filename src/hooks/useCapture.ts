import { useCallback, useRef, useState } from 'react';
import type { CapturedPhoto } from '../types';

function playShutter() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.13);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useCapture(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cancelRef = useRef(false);

  const captureOne = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(1920, video.videoWidth);
    canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    playShutter();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    return { id: crypto.randomUUID(), dataUrl: canvas.toDataURL('image/jpeg', 0.9), takenAt: new Date().toISOString() };
  }, [videoRef]);

  const runSequence = useCallback(async (total: number, onPhoto: (photo: CapturedPhoto) => void) => {
    cancelRef.current = false;
    setIsCapturing(true);
    try {
      for (let index = 0; index < total; index += 1) {
        for (let count = 3; count >= 1; count -= 1) {
          if (cancelRef.current) return;
          setCountdown(count);
          await wait(760);
        }
        setCountdown(null);
        const photo = captureOne();
        if (photo) onPhoto(photo);
        if (index < total - 1) await wait(2000);
      }
    } finally {
      setCountdown(null);
      setIsCapturing(false);
    }
  }, [captureOne]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setCountdown(null);
    setIsCapturing(false);
  }, []);

  return { countdown, flash, isCapturing, captureOne, runSequence, cancel };
}

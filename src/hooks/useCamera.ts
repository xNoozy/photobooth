import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser tidak mendukung WebRTC camera. Gunakan Safari iPad versi terbaru.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, max: 30 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setIsReady(true);
    } catch (err) {
      const message = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Aktifkan Camera permission untuk Safari lalu coba lagi.'
        : 'Kamera tidak bisa dibuka. Pastikan tidak dipakai aplikasi lain dan gunakan HTTPS/local host.';
      setError(message);
      stopCamera();
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, isReady, error, startCamera, stopCamera };
}

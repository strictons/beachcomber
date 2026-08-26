import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

type Status = 'requesting' | 'scanning' | 'denied' | 'unsupported' | 'unavailable';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A real in-page QR scanner (live camera feed decoded with jsQR), rather
 * than just handing the guest off to a generic "take a photo" camera
 * prompt — there's no web API that reliably reproduces the native Camera
 * app's own live QR detection across iOS Safari and Android Chrome.
 */
export default function QrScannerModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const foundRef = useRef(false);
  const [status, setStatus] = useState<Status>('requesting');

  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.play().catch(() => {});
        setStatus('scanning');

        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const tick = () => {
          if (cancelled || foundRef.current) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' });
            if (code?.data) {
              foundRef.current = true;
              handleResult(code.data);
              return;
            }
          }
          frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        setStatus(err.name === 'NotAllowedError' || err.name === 'SecurityError' ? 'denied' : 'unavailable');
      });

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function handleResult(data: string) {
    stopCamera();
    if (/^https?:\/\//i.test(data)) {
      window.location.href = data;
    } else {
      // Not a URL — nothing sensible to navigate to, so just hand the raw
      // text back to the guest instead of silently doing nothing.
      window.alert(`Scanned: ${data}`);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Scan a QR code"
    >
      <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <span className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
          Scan a QR Code
        </span>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          aria-label="Close scanner"
          className="flex h-11 w-11 cursor-pointer items-center justify-center text-white/80 hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>

      {status === 'scanning' && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <div className="relative h-64 w-64 max-w-[70vw]">
            <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-white" />
            <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 border-white" />
            <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-2 border-l-2 border-white" />
            <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-2 border-r-2 border-white" />
          </div>
          <p className="mt-8 text-[13px] font-light text-white/80">Point your camera at a QR code</p>
        </div>
      )}

      {status === 'requesting' && (
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-[13px] text-white/70">Waiting for camera access…</p>
        </div>
      )}

      {(status === 'denied' || status === 'unsupported' || status === 'unavailable') && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-xs text-[14px] leading-relaxed text-white/85">
            {status === 'denied' &&
              "Camera access was blocked. Enable it for this site in your browser settings, then try again."}
            {status === 'unsupported' && "This browser doesn't support scanning from the page."}
            {status === 'unavailable' && "Couldn't access a camera on this device."}
          </p>
          <button
            onClick={onClose}
            className="rounded-full bg-white px-5 py-2.5 font-heading text-[11px] font-medium uppercase tracking-[0.1em] text-[#1d1d1f]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

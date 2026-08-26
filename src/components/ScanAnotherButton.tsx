import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useMenu } from './MenuContext';

// Pulls in jsQR, so it's kept out of the main bundle and only fetched by
// guests who actually tap the button.
const QrScannerModal = lazy(() => import('./QrScannerModal'));

const POSITION_STORAGE_KEY = 'bch-scan-button-position';
const EDGE_MARGIN = 12;
// A pointer has to move this far before a press counts as a drag rather
// than a tap — keeps a slightly shaky tap from being swallowed as a
// (non-)drag that then also suppresses the click.
const DRAG_THRESHOLD = 6;

interface Position {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function clampToViewport(pos: Position, width: number, height: number): Position {
  return {
    x: clamp(pos.x, EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN),
    y: clamp(pos.y, EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN),
  };
}

function loadStoredPosition(): Position | null {
  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed;
  } catch {
    // ignore malformed/unavailable storage
  }
  return null;
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="14.5" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="18.7" y="14.5" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="14.5" y="18.7" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
      <rect x="18.7" y="18.7" width="2.3" height="2.3" rx="0.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Floating shortcut for a guest who's just scanned this guide's QR code and
 * wants to scan a different one (another area of the property, another
 * business) without hunting for a scanning app themselves. Draggable —
 * guests can park it wherever it's least in the way, and that spot is
 * remembered (per device) across visits.
 */
export default function ScanAnotherButton() {
  const { isOpen: menuOpen } = useMenu();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(() => loadStoredPosition());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragOrigin = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const didDragRef = useRef(false);

  // Keep a repositioned button on-screen through a resize/orientation change.
  useEffect(() => {
    function handleResize() {
      const btn = buttonRef.current;
      if (!btn) return;
      setPos((p) => (p ? clampToViewport(p, btn.offsetWidth, btn.offsetHeight) : p));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== undefined && e.button !== 0) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    dragOrigin.current = { startX: e.clientX, startY: e.clientY, baseX: rect.left, baseY: rect.top };
    didDragRef.current = false;
    btn.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const origin = dragOrigin.current;
    if (!origin) return;
    const dx = e.clientX - origin.startX;
    const dy = e.clientY - origin.startY;
    if (!didDragRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    didDragRef.current = true;

    const btn = e.currentTarget;
    setPos(
      clampToViewport({ x: origin.baseX + dx, y: origin.baseY + dy }, btn.offsetWidth, btn.offsetHeight)
    );
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOrigin.current) return;
    dragOrigin.current = null;
    if (didDragRef.current) {
      setPos((p) => {
        if (p) {
          try {
            localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(p));
          } catch {
            // storage unavailable (private mode, quota) — position just won't persist
          }
        }
        return p;
      });
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (didDragRef.current) {
      e.preventDefault();
      didDragRef.current = false;
      return;
    }
    setScannerOpen(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        aria-label="Scan another QR code — drag to reposition"
        className={`fixed z-40 flex touch-none cursor-grab flex-col items-center gap-1.5 transition-opacity duration-300 active:cursor-grabbing ${
          menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={
          pos
            ? { left: pos.x, top: pos.y }
            : { right: '1rem', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }
        }
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.45)] transition-transform duration-150 active:scale-95">
          <QrIcon />
        </span>
        <span className="rounded-full bg-[#1d1d1f]/90 px-2.5 py-1 font-heading text-[9px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_4px_10px_-2px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          QR Scan
        </span>
      </button>

      {scannerOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
          <QrScannerModal onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

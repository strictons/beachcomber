import { lazy, Suspense, useState } from 'react';
import { useMenu } from './MenuContext';

// Pulls in jsQR, so it's kept out of the main bundle and only fetched by
// guests who actually tap the button.
const QrScannerModal = lazy(() => import('./QrScannerModal'));

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
 * business) without hunting for a scanning app themselves.
 */
export default function ScanAnotherButton() {
  const { isOpen: menuOpen } = useMenu();
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setScannerOpen(true)}
        aria-label="Scan another QR code"
        className={`fixed left-4 z-40 flex cursor-pointer flex-col items-center gap-1.5 transition-opacity duration-300 ${
          menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.45)] transition-transform duration-150 active:scale-95">
          <QrIcon />
        </span>
        <span className="rounded-full bg-[#1d1d1f]/90 px-2.5 py-1 font-heading text-[9px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_4px_10px_-2px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          Scan Another
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

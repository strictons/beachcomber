import { useRef } from 'react';
import { useMenu } from './MenuContext';

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
 * Floating shortcut back into the device camera for a guest who's just
 * scanned this guide's QR code and wants to scan a different one (another
 * area of the property, another business) without hunting for the camera
 * app themselves. There's no cross-browser API to launch the camera app
 * directly — a `capture` file input is the standard web mechanism, and it
 * opens the same native camera view (with the OS's own live QR detection)
 * as tapping the camera app icon would.
 */
export default function ScanAnotherButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen: menuOpen } = useMenu();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={() => {
          // Nothing to do with the captured photo itself — the point is
          // just getting the OS's own QR detection in front of the guest.
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
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
    </>
  );
}

import { useEffect } from 'react';

function QrIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.5" y="14.5" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
      <rect x="18.3" y="14.5" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
      <rect x="14.5" y="18.3" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
      <rect x="18.3" y="18.3" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Served at the bare domain root. Each hotel's guide lives at its own path
 * (e.g. /beachcomber-hotel-and-resort) reached only via that property's
 * physical QR code — this page deliberately doesn't link to any of them.
 */
export default function Landing() {
  useEffect(() => {
    document.title = 'Guest Guides — Strictons';
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1d1d1f]/5 text-[#1d1d1f]/60">
        <QrIcon />
      </div>

      <h1 className="mt-6 font-display text-[26px] text-[#1d1d1f] sm:text-[30px]">Guest Guides</h1>

      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-500">
        Every guide here belongs to a specific hotel. Scan the QR code in your room, or ask at the front desk, to
        open yours.
      </p>

      <p className="mt-16 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-300">
        Strictons
      </p>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { cldImageUrl, responsiveSrcSet } from '../data/media';

/** Widths offered to the browser for the full-screen image. */
const LIGHTBOX_WIDTHS = [640, 1024, 1600];

export default function GalleryLightbox({
  images,
  index,
  onClose,
  onChangeIndex,
  altPrefix,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  altPrefix: string;
}) {
  const touchStartX = useRef<number | null>(null);

  const goPrev = () => onChangeIndex((index - 1 + images.length) % images.length);
  const goNext = () => onChangeIndex((index + 1) % images.length);

  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);

  // Warm the neighbouring photos so left/right swipes show instantly.
  useEffect(() => {
    if (images.length < 2) return;
    for (const offset of [1, -1]) {
      const neighbour = images[(index + offset + images.length) % images.length];
      const img = new Image();
      img.src = cldImageUrl(neighbour, 1600);
    }
  }, [index, images]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${altPrefix} photo gallery`}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > 50) goPrev();
        else if (delta < -50) goNext();
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-[12px] font-light tracking-wide text-white/60">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-10 w-10 cursor-pointer items-center justify-center text-white/80 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-10">
        <img
          key={images[index]}
          src={cldImageUrl(images[index], 1600)}
          srcSet={responsiveSrcSet(images[index], LIGHTBOX_WIDTHS)}
          sizes="100vw"
          alt={`${altPrefix} photo ${index + 1}`}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-white/70 hover:text-white sm:left-4"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-white/70 hover:text-white sm:right-4"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type Status = 'loading' | 'ready' | 'error';

const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
const ZOOM_STEP = 50;
/** Render this many times sharper than a 100%-zoom display needs, so zooming in to MAX_ZOOM stays crisp instead of just stretching soft pixels. */
const RENDER_OVERSAMPLE = MAX_ZOOM / 100;
/** Hard ceiling on a single page's rendered pixel width, regardless of container size or device pixel ratio — keeps canvases well inside every browser's texture-size limits and memory reasonable. */
const MAX_CANVAS_WIDTH = 4000;
/** Thickness of the custom scrollbar tracks, and the gap held between them and the PDF content. */
const SCROLLBAR_THICKNESS = 6;
const SCROLLBAR_GAP = 6;
const SCROLLBAR_INSET = SCROLLBAR_THICKNESS + SCROLLBAR_GAP;
/** Never let a scrollbar thumb shrink below this — a sliver a few px wide stops being visible/usable. */
const MIN_THUMB_PERCENT = 10;

interface ScrollMetrics {
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

/**
 * `clientWidth` can still read 0 on the very first effect pass — e.g. a
 * layout not yet settled on a cold page load — so wait for a real layout
 * event via ResizeObserver rather than polling requestAnimationFrame, which
 * can stall indefinitely in a backgrounded/inactive tab.
 */
function measureWidth(el: HTMLElement): Promise<number> {
  if (el.clientWidth > 0) return Promise.resolve(el.clientWidth);
  return new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (el.clientWidth > 0) {
        observer.disconnect();
        resolve(el.clientWidth);
      }
    });
    observer.observe(el);
    // Safety net: never hang forever even if a size is genuinely unreachable.
    setTimeout(() => {
      observer.disconnect();
      resolve(el.clientWidth);
    }, 2000);
  });
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function ZoomIcon({ out = false }: { out?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {!out && <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}

/**
 * A thumb on a track, sized/positioned from scroll metrics — drawn ourselves
 * (rather than the browser's native scrollbar) so it (a) stays visible even
 * when nothing is scrollable yet, as a "this pans" affordance, and (b) shows
 * up at all on mobile, where native scrollbars are overlay-only and never
 * persist.
 */
function ScrollbarTrack({
  axis,
  metrics,
}: {
  axis: 'x' | 'y';
  metrics: ScrollMetrics;
}) {
  const isX = axis === 'x';
  const scrollSize = isX ? metrics.scrollWidth : metrics.scrollHeight;
  const clientSize = isX ? metrics.clientWidth : metrics.clientHeight;
  const scrollPos = isX ? metrics.scrollLeft : metrics.scrollTop;

  const rawThumbPercent = scrollSize > 0 ? (clientSize / scrollSize) * 100 : 100;
  const thumbPercent = Math.min(100, Math.max(rawThumbPercent, MIN_THUMB_PERCENT));
  const maxScroll = Math.max(scrollSize - clientSize, 0);
  const scrollProgress = maxScroll > 0 ? scrollPos / maxScroll : 0;
  const thumbOffsetPercent = scrollProgress * (100 - thumbPercent);

  return (
    <div
      className={`absolute rounded-full bg-neutral-100 ${isX ? 'bottom-0 left-0' : 'right-0 top-0'}`}
      style={
        isX
          ? { right: SCROLLBAR_INSET, height: SCROLLBAR_THICKNESS }
          : { bottom: SCROLLBAR_INSET, width: SCROLLBAR_THICKNESS }
      }
    >
      <div
        className="absolute rounded-full bg-neutral-300"
        style={
          isX
            ? { left: `${thumbOffsetPercent}%`, width: `${thumbPercent}%`, height: '100%' }
            : { top: `${thumbOffsetPercent}%`, height: `${thumbPercent}%`, width: '100%' }
        }
      />
    </div>
  );
}

/**
 * Renders every page of a PDF as a stack of canvases sized to the container's
 * width. Native `<iframe src="file.pdf">` viewers vary wildly across devices
 * (letterboxed chrome, tiny default zoom, unreliable inline rendering on some
 * mobile browsers) — rendering the pages ourselves gives a consistent,
 * full-width, scrollable result everywhere.
 *
 * Pages are oversampled well past what a 100%-zoom display needs, and zoom
 * is applied by widening the rendered content inside a scrollable strip whose
 * own height is locked to its 100%-zoom size — so "zoom in" is a real
 * resolution increase (crisp up to MAX_ZOOM) that the guest pans around
 * inside a card that doesn't itself grow, rather than a CSS stretch that
 * makes the whole page taller. Panning is the browser's native touch/drag
 * scroll; two-finger pinch is handled ourselves (see the touch effect below)
 * so it adjusts our own zoom state instead of the whole page's native zoom.
 */
export default function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const zoomRef = useRef(zoom);
  // Measured once at the 100%-zoom render, then locked in — so the card's
  // on-screen footprint stays put as the guest zooms; only the PDF inside it
  // grows and becomes pannable, rather than the whole page growing taller.
  const [baseHeight, setBaseHeight] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 1,
    scrollHeight: 1,
    clientWidth: 1,
    clientHeight: 1,
  });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus('loading');
    setBaseHeight(null);
    container.replaceChildren();

    async function render() {
      try {
        const [pdf, containerWidth] = await Promise.all([
          pdfjsLib.getDocument({ url: src }).promise,
          measureWidth(container!),
        ]);
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (containerWidth <= 0) throw new Error('PDF container has no measurable width');

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const unscaledWidth = page.getViewport({ scale: 1 }).width;
          let scale = (containerWidth / unscaledWidth) * dpr * RENDER_OVERSAMPLE;
          if (unscaledWidth * scale > MAX_CANVAS_WIDTH) scale = MAX_CANVAS_WIDTH / unscaledWidth;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          if (pageNum > 1) canvas.style.marginTop = '12px';
          container!.appendChild(canvas);

          if (cancelled) return;
          await page.render({ canvas, viewport }).promise;
        }

        if (!cancelled) {
          setBaseHeight(container!.scrollHeight);
          setStatus('ready');
        }
      } catch (err) {
        console.error('Failed to render PDF', err);
        if (!cancelled) setStatus('error');
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Keeps the custom scrollbar thumbs in sync: on every native scroll event,
  // and on every size change the zoom-driven width transition produces
  // (ResizeObserver fires continuously through a CSS transition, so the
  // thumb shrinks/grows in step with it rather than jumping at the end).
  useEffect(() => {
    if (status !== 'ready') return;
    const scrollEl = scrollRef.current;
    const contentEl = containerRef.current;
    if (!scrollEl || !contentEl) return;

    function sync() {
      const el = scrollRef.current;
      if (!el) return;
      setMetrics({
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
      });
    }

    sync();
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(contentEl);
    scrollEl.addEventListener('scroll', sync, { passive: true });
    return () => {
      resizeObserver.disconnect();
      scrollEl.removeEventListener('scroll', sync);
    };
  }, [status]);

  // Two-finger pinch adjusts zoom directly. touch-action: pan-x pan-y (set
  // below) already stops the browser's own native pinch-zoom from also
  // firing on this element; preventDefault here is just a belt-and-braces
  // second line of defense against it. Single-finger panning is untouched —
  // it's still the browser's native scroll on `scrollRef`.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pinchStartDistance: number | null = null;
    let pinchStartZoom = MIN_ZOOM;

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchStartDistance = touchDistance(e.touches[0], e.touches[1]);
        pinchStartZoom = zoomRef.current;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchStartDistance) {
        e.preventDefault();
        const distance = touchDistance(e.touches[0], e.touches[1]);
        const next = (pinchStartZoom * distance) / pinchStartDistance;
        setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)));
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinchStartDistance = null;
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  function setZoomAndResetScroll(updater: (current: number) => number) {
    setZoom(updater);
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollLeft = 0;
      scrollEl.scrollTop = 0;
    }
  }

  const displayZoom = Math.round(zoom);

  return (
    <div className="relative">
      {status === 'ready' && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:bg-neutral-200"
          >
            Open PDF in Browser
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setZoomAndResetScroll((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-neutral-100"
            >
              <ZoomIcon out />
            </button>
            <span className="w-10 text-center font-heading text-[11px] font-medium text-neutral-400">
              {displayZoom}%
            </span>
            <button
              onClick={() => setZoomAndResetScroll((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-neutral-100"
            >
              <ZoomIcon />
            </button>
          </div>
        </div>
      )}

      <div className="relative" style={{ paddingRight: SCROLLBAR_INSET, paddingBottom: SCROLLBAR_INSET }}>
        <div
          ref={scrollRef}
          className="pdf-scroll-hide overflow-auto [touch-action:pan-x_pan-y]"
          style={baseHeight ? { height: baseHeight } : undefined}
        >
          {/* Kept in normal flow (never display:none) so its width is measurable
              while rendering, and so the finished card hugs the page images'
              actual height instead of stretching to fill its container. */}
          <div ref={containerRef} style={{ width: `${zoom}%`, transition: 'width 150ms ease-out' }} />
        </div>

        {status === 'ready' && (
          <>
            <ScrollbarTrack axis="x" metrics={metrics} />
            <ScrollbarTrack axis="y" metrics={metrics} />
          </>
        )}
      </div>

      {status === 'loading' && (
        <div className="flex h-[60vh] items-center justify-center text-[13px] text-neutral-400">Loading menu…</div>
      )}
      {status === 'error' && (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center text-[13px] text-neutral-500">
          <p>We couldn't load this menu.</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1d1d1f] underline">
            Open the PDF directly
          </a>
        </div>
      )}
    </div>
  );
}

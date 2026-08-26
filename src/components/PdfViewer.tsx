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

function ZoomIcon({ out = false }: { out?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {!out && <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
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
 * is applied by widening the rendered content inside a horizontally
 * scrollable strip — so "zoom in" is a real resolution increase (crisp up to
 * MAX_ZOOM), not a CSS stretch of the same pixels, and panning is just the
 * browser's native touch/drag scroll rather than custom gesture code.
 */
export default function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus('loading');
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

        if (!cancelled) setStatus('ready');
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

  return (
    <div className="relative">
      {status === 'ready' && (
        <div className="mb-2 flex items-center justify-end gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-neutral-100"
          >
            <ZoomIcon out />
          </button>
          <span className="w-10 text-center font-heading text-[11px] font-medium text-neutral-400">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-neutral-100"
          >
            <ZoomIcon />
          </button>
        </div>
      )}

      <div className="overflow-x-auto overflow-y-visible">
        {/* Kept in normal flow (never display:none) so its width is measurable
            while rendering, and so the finished card hugs the page images'
            actual height instead of stretching to fill its container. */}
        <div ref={containerRef} style={{ width: `${zoom}%`, transition: 'width 150ms ease-out' }} />
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

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type Status = 'loading' | 'ready' | 'error';

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

/**
 * Renders every page of a PDF as a stack of canvases sized to the container's
 * width. Native `<iframe src="file.pdf">` viewers vary wildly across devices
 * (letterboxed chrome, tiny default zoom, unreliable inline rendering on some
 * mobile browsers) — rendering the pages ourselves gives a consistent,
 * full-width, scrollable result everywhere.
 */
export default function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');

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
          const viewport = page.getViewport({ scale: (containerWidth / unscaledWidth) * dpr });

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
      {/* Kept in normal flow (never display:none) so its width is measurable
          while rendering, and so the finished card hugs the page images'
          actual height instead of stretching to fill its container. */}
      <div ref={containerRef} />

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

import type { Root } from 'react-dom/client';
import { Map as MapLibreMap } from 'maplibre-gl';
import type { Business, BusinessType } from '../data/businesses';
import { categoryIcons, hotelIcon } from '../data/categoryIcons';

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export const CATEGORY_COLOR: Record<BusinessType, string> = {
  'eat-drink': '#567791',
  'things-to-do': '#c17a4f',
};

export const HOTEL_COLOR = '#1d1d1f';

export type NearbyBusiness = Business & { lat: number; lng: number };

/** Uniformly scales+centers an icon's true content bounds into a `box`-sized square around the origin. */
function fitIconTransform(icon: { x: number; y: number; width: number; height: number }, box: number): string {
  const scale = box / Math.max(icon.width, icon.height);
  const tx = -(icon.x + icon.width / 2) * scale;
  const ty = -(icon.y + icon.height / 2) * scale;
  return `translate(${tx},${ty}) scale(${scale})`;
}

/** Icon markup for a pin, centered on the pin's own (0,0) origin. */
const PIN_ICONS: Record<'hotel' | BusinessType, string> = {
  hotel: `<g fill="white" transform="${fitIconTransform(hotelIcon, 20)}">${hotelIcon.inner}</g>`,
  'eat-drink': `<g fill="white" transform="${fitIconTransform(categoryIcons['eat-drink'], 19)}">${
    categoryIcons['eat-drink'].inner
  }</g>`,
  'things-to-do': `<g fill="white" transform="${fitIconTransform(categoryIcons['things-to-do'], 20)}">${
    categoryIcons['things-to-do'].inner
  }</g>`,
};

/**
 * The teardrop path's own bounding box is exactly 34x44 (0,0 to 34,44), but
 * its 2px white stroke is centered on that outline, so half of it (1px) falls
 * outside the box. A viewBox that matches the path exactly clips that outer
 * half-pixel off the left, right and top edges — the "cut off" look. Padding
 * the viewBox by the stroke's half-width on every side keeps the full stroke
 * on-canvas without shifting the path's own coordinates.
 */
const PIN_STROKE_WIDTH = 2;
const PIN_PAD = PIN_STROKE_WIDTH / 2;
const PIN_BOX_WIDTH = 34 + PIN_PAD * 2;
const PIN_BOX_HEIGHT = 44 + PIN_PAD * 2;

function pinMarkup(color: string, kind: 'hotel' | BusinessType, size: number): string {
  return `
    <svg width="${size}" height="${size * (PIN_BOX_HEIGHT / PIN_BOX_WIDTH)}" viewBox="-${PIN_PAD} -${PIN_PAD} ${PIN_BOX_WIDTH} ${PIN_BOX_HEIGHT}" style="display:block; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0z" fill="${color}" stroke="white" stroke-width="${PIN_STROKE_WIDTH}"/>
      <g transform="translate(17,16)">${PIN_ICONS[kind]}</g>
    </svg>
  `;
}

/**
 * MapLibre positions a Marker by writing `transform: translate(...)` directly
 * onto the element it's given, so our own hover/active styling must live on
 * an inner wrapper instead — animating the outer element would clobber the
 * positioning transform and fling the pin away from its real coordinate.
 */
export function createPinElement(color: string, kind: 'hotel' | BusinessType, size: number): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cursor = 'pointer';

  const inner = document.createElement('div');
  inner.className = 'bch-pin';
  inner.style.transformOrigin = 'bottom center';
  inner.style.transition = 'transform 0.15s ease';
  inner.innerHTML = pinMarkup(color, kind, size);
  el.appendChild(inner);

  el.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.12)';
  });
  el.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1)';
  });
  return el;
}

/**
 * Nudges the camera just enough that an open popup sits fully inside the map
 * frame — MapLibre's built-in anchor-flip only chooses which side of the pin
 * to open on, it doesn't guarantee the popup fits, so a popup near an edge
 * (or one that's simply too tall for the space) can still spill outside the
 * rounded card. This measures the popup against the map container after it
 * renders and pans by exactly the overflow, in whichever direction(s) it's
 * clipped.
 */
export function panPopupIntoView(m: MapLibreMap, popupEl: HTMLElement | undefined) {
  if (!popupEl) return;
  const mapRect = m.getContainer().getBoundingClientRect();
  const popRect = popupEl.getBoundingClientRect();
  const MARGIN = 24;

  let dx = 0;
  let dy = 0;
  if (popRect.left < mapRect.left + MARGIN) dx = popRect.left - (mapRect.left + MARGIN);
  else if (popRect.right > mapRect.right - MARGIN) dx = popRect.right - (mapRect.right - MARGIN);
  if (popRect.top < mapRect.top + MARGIN) dy = popRect.top - (mapRect.top + MARGIN);
  else if (popRect.bottom > mapRect.bottom - MARGIN) dy = popRect.bottom - (mapRect.bottom - MARGIN);
  if (dx === 0 && dy === 0) return;

  const centerPoint = m.project(m.getCenter());
  const newCenter = m.unproject([centerPoint.x + dx, centerPoint.y + dy]);
  m.easeTo({ center: newCenter, duration: 300 });
}

/**
 * MapLibre's `compact: true` attribution control only auto-collapses once
 * the map is dragged — the very first time the style loads and attribution
 * text populates, it force-opens itself (adds `maplibregl-compact-show`).
 * Called on every 'styledata' event, this mirrors the control's own click
 * handler to close it again right after that happens, so the map starts
 * with just the small "i" icon and expands normally on click.
 */
export function collapseAttribution(m: MapLibreMap) {
  const attribEl = m.getContainer().querySelector<HTMLElement>('.maplibregl-ctrl-attrib');
  if (!attribEl || !attribEl.classList.contains('maplibregl-compact-show')) return;
  attribEl.setAttribute('open', '');
  attribEl.classList.remove('maplibregl-compact-show');
}

/**
 * React can still be mid-flight on a root's very first render when we
 * unmount it (e.g. StrictMode's synchronous mount→cleanup→mount replay in
 * dev, or a cluster split rebuilding popups the instant after they were
 * created) — unmounting in that window logs "Attempted to synchronously
 * unmount a root while React was already rendering". A microtask isn't a
 * long enough delay to clear it (React's render flag survives until the
 * surrounding commit's call stack fully unwinds); a macrotask is.
 */
export function deferredUnmount(root: Root) {
  setTimeout(() => root.unmount(), 0);
}

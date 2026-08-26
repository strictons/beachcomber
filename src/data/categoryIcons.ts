import eatDrinkSvgRaw from '../assets/eat-drink.svg?raw';
import thingsToDoSvgRaw from '../assets/things-to-do.svg?raw';
import palmTreeSvgRaw from '../assets/palm-tree.svg?raw';
import type { BusinessType } from './businesses';

export interface IconSvgData {
  /** A viewBox tightly cropped to the actual drawn content (not the source file's nominal viewBox). */
  viewBox: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The markup between the source file's <svg> tags, ready to drop into another SVG. */
  inner: string;
}

/**
 * Source icon files may have empty margin baked into their viewBox (the
 * things-to-do artwork only fills the top-left of its box), which throws off
 * any attempt to center or scale them relative to that viewBox. Rendering
 * the markup once into a detached SVG and reading getBBox() gives the true
 * bounds of the drawn paths, so every consumer can size/center against that.
 */
function measureContentBBox(innerMarkup: string): { x: number; y: number; width: number; height: number } {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.overflow = 'hidden';
  svg.innerHTML = innerMarkup;
  document.body.appendChild(svg);
  const box = svg.getBBox();
  document.body.removeChild(svg);
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}

function parseIconSvg(raw: string): IconSvgData {
  const inner = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1]?.trim() ?? '';
  const { x, y, width, height } = measureContentBBox(inner);
  return { viewBox: `${x} ${y} ${width} ${height}`, x, y, width, height, inner };
}

/** The Eat & Drink and Things To Do category artwork, shared by the filter pills and the map pins. */
export const categoryIcons: Record<BusinessType, IconSvgData> = {
  'eat-drink': parseIconSvg(eatDrinkSvgRaw),
  'things-to-do': parseIconSvg(thingsToDoSvgRaw),
};

/** The palm tree artwork used for the hotel's own map pin. */
export const hotelIcon: IconSvgData = parseIconSvg(palmTreeSvgRaw);

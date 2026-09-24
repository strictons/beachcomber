/**
 * Every image and video URL used across the app lives in this one file.
 *
 * To swap a placeholder photo (or the logo, or the hero video) over to
 * Cloudinary — or any other host — just replace the URL string on the
 * right-hand side of the relevant line below. Nothing else in the codebase
 * needs to change.
 */

import logoAsset from '../assets/beachcomber-logo.png';

// =============================================================================
// Image placement
//
// Every image on the site is cropped to fill its frame (object-cover), and
// this controls *which part* of the photo stays visible when that happens —
// the same idea as CSS `object-position`.
//
// Every image defaults to "top" below. To customise one, upgrade its
// plain URL string to an object with a `position`:
//
//   hero: picsum('example-hero'),                                  // default: top
//   hero: { url: picsum('example-hero'), position: 'center' },     // centered instead
//   hero: { url: picsum('example-hero'), position: 'bottom' },     // anchor to the bottom
//   hero: { url: picsum('example-hero'), position: '20% 80%' },    // anywhere via % coords
//
// `position` accepts any valid CSS object-position value: keywords (top,
// bottom, left, right, center, and combinations like "top left"), or precise
// "x% y%" coordinates for pixel-level control.
// =============================================================================

export const DEFAULT_IMAGE_POSITION = 'top';

/**
 * A plain URL (default position, no upscaling) or `{ url, position, upscale }`
 * for a custom crop anchor and/or AI upscaling. Set `upscale: true` for a
 * photo whose source is noticeably smaller than the size it's displayed at —
 * see `responsiveSrcSet` below for what that actually does.
 */
export type ImageInput = string | { url: string; position?: string; upscale?: boolean };

export interface PositionedImage {
  url: string;
  position: string;
  upscale: boolean;
}

export function resolveImage(input: ImageInput): PositionedImage {
  return typeof input === 'string'
    ? { url: input, position: DEFAULT_IMAGE_POSITION, upscale: false }
    : {
        url: input.url,
        position: input.position ?? DEFAULT_IMAGE_POSITION,
        upscale: input.upscale ?? false,
      };
}

// =============================================================================
// LOGO
// =============================================================================

export const LOGO_URL = logoAsset;

// =============================================================================
// HOME — hero background video
// =============================================================================

export const HOME_HERO_VIDEO_URL =
  'https://res.cloudinary.com/q4tmczid/video/upload/v1790238509/hf_20260924_082210_e0230f8f-210a-4eee-8661-f358824b502e.mp4';
export const HOME_HERO_MOBILE_VIDEO_URL =
  'https://res.cloudinary.com/q4tmczid/video/upload/v1790238980/hf_20260924_083128_bfc07bfb-0934-466e-96e9-4f19807050ca.mp4';

// =============================================================================
// HOTEL INFORMATION — hero photo
// =============================================================================

export const HOTEL_INFO_HERO_IMAGE_URL: ImageInput = {
  url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787628938/reception.jpg',
  position: 'top',
};

// =============================================================================
// Shared shape for a business's photos: one hero image + a gallery.
// Gallery can hold any number of photos (including none yet) — up to 4 is
// the usual target, but it's fine to leave it empty while real photos are
// still being sourced for a business.
// =============================================================================

export interface BusinessImages {
  hero: ImageInput;
  gallery: ImageInput[];
}

// =============================================================================
// EAT & DRINK — hero + gallery photos, one block per business
// =============================================================================

export const eatAndDrinkImages: Record<string, BusinessImages> = {
  // The Beachie Bar and Bistro
  'the-beachie-bar-and-bistro': {
    hero: {
      url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787629199/bistro.jpg',
      position: 'center',
    },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787629193/bistro1.png', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787629183/bistro2.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787629169/bistro3.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787703853/bistro-beer.jpg', position: 'top' },
    ],
  },

  // Pelicans Restaurant
  'pelicans-restaurant': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010670/pelicans.tiff', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010076/breakfast.tiff', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787712726/pelicans3.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787712731/pelicans4.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787712864/pelicans5.jpg', position: 'top' },
    ],
  },

  // BB's Soul Kitchen
  'bbs-soul-kitchen': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630102/bbsoul.png', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704933/bb2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704936/bb1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704940/bb4.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704935/bb3.webp', position: 'top' },
    ],
  },

  // Johnny Tapas
  'johnny-tapas': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630348/tapas.jpg', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787713060/tapas1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787713049/tapas4.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787713044/tapas2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787713041/tapas3.webp', position: 'top' },
    ],
  },

  // Motel Mezza
  'motel-mezza': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630545/mezza.webp', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721295/mezza1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721289/mezza2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721307/mezza3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721312/mezza4.webp', position: 'top' },
    ],
  },

  // Wyong Milk Factory
  'wyong-milk-factory': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630547/Wyong_Milk_Factoru.jpg', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721284/wyong1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721278/wyong2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721270/wyong3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721265/wyong4.webp', position: 'top' },
    ],
  },

  // Mexicoast Cantina
  'mexicoast-cantina': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010477/Mexicoast.tiff', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706436/mexi4.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706432/mexi3.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706429/mexi2.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706580/mexi1.png', position: 'top' },
    ],
  },

  // Cue & Crew
  'cue-and-crew': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010120/cue.tiff', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787712070/cue1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706669/cue2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706672/cue3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787706678/cue4.webp', position: 'top' },
    ],
  },

  // The Savoy Bar & Music
  'the-savoy-bar-and-music': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704042/savoybar.png', position: 'center' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704532/savoy1.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704533/savoy2.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787704541/savoy3.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630546/savoy.jpg', position: 'top' },
    ],
  },
};

// =============================================================================
// THINGS TO DO — hero + gallery photos, one block per business
// =============================================================================

export const thingsToDoImages: Record<string, BusinessImages> = {
  // Live Entertainment
  'live-entertainment': {
    // Source is only 554x554 — AI-upscaled as a test case, see responsiveSrcSet.
    hero: {
      url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787631868/livemusic.jpg',
      position: 'top',
      upscale: true,
    },
    gallery: [
      //{ url: picsum('live-ent-1'), position: 'top' },
      //{ url: picsum('live-ent-2'), position: 'top' },
      //{ url: picsum('live-ent-3'), position: 'top' },
      //{ url: picsum('live-ent-4'), position: 'top' },
    ],
  },

  // Heated Pool & Spa
  'heated-pool-and-spa': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010765/POOL.tiff', position: 'top' },
    gallery: [
      //{ url: picsum('pool-spa-1'), position: 'top' },
      //{ url: picsum('pool-spa-2'), position: 'top' },
      //{ url: picsum('pool-spa-3'), position: 'top' },
      //{ url: picsum('pool-spa-4'), position: 'top' },
    ],
  },

  // Kids Playground
  'kids-playground': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010735/playground.tiff', position: 'center' },
    gallery: [
      //{ url: picsum('kids-play-1'), position: 'top' },
      //{ url: picsum('kids-play-2'), position: 'top' },
      //{ url: picsum('kids-play-3'), position: 'top' },
      //{ url: picsum('kids-play-4'), position: 'top' },
    ],
  },

  // Saturday Yoga
  'saturday-yoga': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787631962/yoga.png', position: 'center' },
    gallery: [
      //{ url: picsum('yoga-1'), position: 'top' },
      //{ url: picsum('yoga-2'), position: 'top' },
      //{ url: picsum('yoga-3'), position: 'top' },
      //{ url: picsum('yoga-4'), position: 'top' },
    ],
  },

  // Australian Reptile Park
  'australian-reptile-park': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787630903/reptilepark.jpg', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721263/reptile-park1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721254/reptile-park2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721250/reptile-park3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721239/reptile-park4.webp', position: 'top' },
    ],
  },

  // Broken Bay Pearl Farm
  'broken-bay-pearl-farm': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1788265459/broken-bay-pearl-farm.jpg', position: 'center' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721236/pearl-farm1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721222/pearl-farm3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721234/pearl-farm2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721214/pearl-farm4.webp', position: 'top' },
    ],
  },

  // Chocolate Factory
  'chocolate-factory': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010114/Chocolate-Factory.tiff', position: 'center' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721211/chocolate-factory1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721204/chocolate-factory2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721196/chocolate-factory3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721190/chocolate-factory4.webp', position: 'top' },
    ],
  },

  // Iris Lodge Alpacas
  'iris-lodge-alpacas': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010274/Iris.tiff', position: 'center' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721181/iris2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721183/iris3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721167/iris4.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721184/iris1.webp', position: 'top' },
    ],
  },

  // TreeTops Adventure Central Coast
  'treetops-adventure': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787632106/treetops.png', position: 'top' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721153/treetops-2.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721141/treetops-1.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721178/treetops-3.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721162/treetops-4.jpg', position: 'top' },
    ],
  },

  // BattleKart Tuggerah
  'battlekart-tuggerah': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721351/battlekart-hero.png', position: 'center' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721223/battle-kart1.jpg', position: 'top right' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721164/battle-kart4.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721131/battle-kart2.jpg', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787721122/battle-kart3.jpg', position: 'top' },
    ],
  },

  // Ken Duncan Gallery
  'ken-duncan-gallery': {
    // Source is only 600x450 — AI-upscaled as a test case, see responsiveSrcSet.
    hero: {
      url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787010201/KenDuncanGalleryCREDITdnsw.tiff',
      position: 'center',
      upscale: true,
    },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722320/ken-duncan1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722314/ken-duncan2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722301/ken-duncan4.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722307/ken-duncan3.webp', position: 'top' },
    ],
  },

  // Central Coast Aero Club
  'central-coast-aero-club': {
    hero: { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1788265652/ccac-hero.jpg', position: 'center left' },
    gallery: [
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722301/ccac1.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722286/ccac2.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722279/ccac3.webp', position: 'top' },
      { url: 'https://res.cloudinary.com/q4tmczid/image/upload/v1787722273/ccac4.webp', position: 'top' },
    ],
  },
};

// =============================================================================
// Responsive image URL helper — understands both picsum and Cloudinary URLs,
// so swapping the URLs above over to Cloudinary keeps this working unchanged.
// =============================================================================

const PICSUM_URL = /^(.*\/seed\/[^/]+\/)(\d+)\/(\d+)$/;

// Matches any Cloudinary delivery URL, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/<optional transforms>/<public_id>
const CLOUDINARY_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;
const CLOUDINARY_VIDEO_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*)$/;

/**
 * Shared Cloudinary transform segment. Kept byte-for-byte identical to what
 * `responsiveSrcSet` emits so a `src` built here reuses a `srcSet` variant's
 * already-generated (CDN-warm) derivative instead of triggering a fresh,
 * slow on-demand transformation.
 */
function cldTransforms(width: number, upscale: boolean): string {
  return `${upscale ? 'e_upscale/' : ''}w_${width},c_limit,f_auto,q_auto`;
}

/**
 * A single, sensibly-sized delivery URL for a plain `<img src>`.
 *
 * The raw URLs in this file point at the untouched originals — often a
 * multi-megabyte `.tiff`/`.png` that no browser can even display inline. The
 * `srcSet` built by `responsiveSrcSet` covers modern browsers, but the bare
 * `src` is still the fallback *and* an LCP candidate the browser may fetch
 * eagerly. Routing every `src` through here caps the width and lets
 * Cloudinary pick a modern format + quality, so nothing ever downloads the
 * raw original. No-op for non-Cloudinary URLs (e.g. the bundled logo).
 */
export function cldImageUrl(url: string, width: number, upscale = false): string {
  const match = url.match(CLOUDINARY_URL);
  if (!match) return url;
  const [, base, publicId] = match;
  return `${base}${cldTransforms(width, upscale)}/${publicId}`;
}

/**
 * A compressed, width-capped delivery URL for a background `<video src>`.
 * `f_auto` picks webm/mp4 per browser, `vc_auto` the matching codec,
 * `q_auto` a sane bitrate. A full-bleed ambient loop never needs the full
 * source resolution. No-op for non-Cloudinary URLs.
 */
export function cldVideoUrl(url: string, width: number): string {
  const match = url.match(CLOUDINARY_VIDEO_URL);
  if (!match) return url;
  const [, base, publicId] = match;
  return `${base}w_${width},c_limit,f_auto,q_auto,vc_auto/${publicId}`;
}

/**
 * A poster still (first frame) for a Cloudinary video, so the hero paints
 * instantly instead of showing black until the video buffers. No-op for
 * non-Cloudinary URLs (returns '' so the attribute can be omitted).
 */
export function cldVideoPosterUrl(url: string, width: number): string {
  const match = url.match(CLOUDINARY_VIDEO_URL);
  if (!match) return '';
  const [, base, publicId] = match;
  const asJpg = publicId.replace(/\.(mp4|webm|mov|m4v|ogv)$/i, '');
  return `${base}so_0,w_${width},c_limit,f_auto,q_auto/${asJpg}.jpg`;
}

/**
 * Builds a srcSet requesting the same image at several widths, so the browser
 * can fetch one sized to how large it's actually rendered instead of always
 * the full source dimensions.
 *
 * `upscale: true` (Cloudinary URLs only) additionally runs the source through
 * Cloudinary's AI upscale effect before resizing, which fills in plausible
 * detail via a model rather than just stretching the pixels that exist. It's
 * meant for the specific photos a business has only supplied at low
 * resolution — flip it on for a given image via `upscale` in media.ts (see
 * `ImageInput`) rather than defaulting every image to it, since it only
 * works on sources under ~2048x2048px and costs an extra Cloudinary
 * transformation the first time each size is requested.
 */
export function responsiveSrcSet(url: string, widths: number[], upscale = false): string | undefined {
  const picsumMatch = url.match(PICSUM_URL);
  if (picsumMatch) {
    const [, base, sourceW, sourceH] = picsumMatch;
    const aspect = Number(sourceH) / Number(sourceW);
    return widths.map((w) => `${base}${w}/${Math.round(w * aspect)} ${w}w`).join(', ');
  }

  const cloudinaryMatch = url.match(CLOUDINARY_URL);
  if (cloudinaryMatch) {
    const [, base, publicId] = cloudinaryMatch;
    return widths.map((w) => `${base}${cldTransforms(w, upscale)}/${publicId} ${w}w`).join(', ');
  }

  return undefined;
}

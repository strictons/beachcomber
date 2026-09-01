import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { cldImageUrl } from '../data/media';

/** Width of the plain-`src` fallback — the srcSet still serves smaller/larger variants. */
const HERO_FALLBACK_WIDTH = 1280;

export default function Hero({
  image,
  srcSet,
  sizes = '100vw',
  objectPosition = 'center top',
  heightClass = 'h-[46vh] min-h-[320px]',
  children,
  overlay = 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.55) 100%)',
}: {
  image: string;
  srcSet?: string;
  sizes?: string;
  /** CSS object-position value controlling which part of the photo stays visible when cropped. */
  objectPosition?: string;
  heightClass?: string;
  children?: ReactNode;
  overlay?: string;
}) {
  const src = cldImageUrl(image, HERO_FALLBACK_WIDTH);

  // Kick the hero download off the moment this renders, rather than waiting
  // for the <img> to commit to the DOM — this is the page's LCP element.
  // Matching srcSet/sizes so the browser reuses this fetch for the <img>.
  preload(src, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: srcSet,
    imageSizes: srcSet ? sizes : undefined,
  });

  return (
    <div className={`relative w-full overflow-hidden ${heightClass}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt=""
        fetchPriority="high"
        decoding="async"
        style={{ objectPosition }}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: overlay }} />
      {children}
    </div>
  );
}

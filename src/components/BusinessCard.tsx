import { preload } from 'react-dom';
import { Link } from 'react-router-dom';
import { responsiveSrcSet, cldImageUrl, type Business } from '../data/businesses';

const CARD_SIZES = '(min-width: 640px) 480px, 100vw';
const CARD_WIDTHS = [480, 720, 960];

export default function BusinessCard({
  business,
  basePath,
  priority = false,
  className = '',
}: {
  business: Business;
  basePath: string;
  priority?: boolean;
  className?: string;
}) {
  const src = cldImageUrl(business.image.url, 720, business.image.upscale);
  const srcSet = responsiveSrcSet(business.image.url, CARD_WIDTHS, business.image.upscale);

  // Above-the-fold cards: start the fetch before the <img> commits.
  if (priority) {
    preload(src, { as: 'image', fetchPriority: 'high', imageSrcSet: srcSet, imageSizes: CARD_SIZES });
  }

  return (
    <Link to={`${basePath}/${business.id}`} className={`group flex flex-col ${className}`}>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.18)]">
        <img
          src={src}
          srcSet={srcSet}
          sizes={CARD_SIZES}
          alt={business.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding={priority ? 'sync' : 'async'}
          draggable={false}
          style={{ objectPosition: business.image.position }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-[15px] font-medium text-[#1d1d1f] transition-colors duration-200 group-hover:text-[#567791]">
            {business.name}
          </h3>
          <p className="text-[13px] text-neutral-500">{business.category}</p>
        </div>
      </div>
    </Link>
  );
}

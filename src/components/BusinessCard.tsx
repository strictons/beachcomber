import { Link } from 'react-router-dom';
import { responsiveSrcSet, type Business } from '../data/businesses';

export default function BusinessCard({
  business,
  basePath,
  priority = false,
}: {
  business: Business;
  basePath: string;
  priority?: boolean;
}) {
  return (
    <Link
      to={`${basePath}/${business.id}`}
      className="group flex flex-col"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <img
          src={business.image}
          srcSet={responsiveSrcSet(business.image, [480, 720, 960])}
          sizes="(min-width: 640px) 480px, 100vw"
          alt={business.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding={priority ? 'sync' : 'async'}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium tracking-wide text-[#1d1d1f] backdrop-blur">
          {business.location}
        </span>
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-[15px] font-medium text-[#1d1d1f]">{business.name}</h3>
          <p className="text-[13px] text-neutral-500">{business.category}</p>
        </div>
      </div>
    </Link>
  );
}

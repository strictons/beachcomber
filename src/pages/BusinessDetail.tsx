import { useParams, Navigate } from 'react-router-dom';
import Hero from '../components/Hero';
import NavBar from '../components/NavBar';
import { getBusinessById, responsiveSrcSet } from '../data/businesses';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const business = id ? getBusinessById(id) : undefined;

  if (!business) return <Navigate to="/" replace />;

  const basePath = business.type === 'eat-drink' ? '/eat-drink' : '/things-to-do';
  const directionsUrl = `https://maps.apple.com/?q=${encodeURIComponent(
    `${business.name}, ${business.address}`
  )}`;

  return (
    <div className="min-h-screen bg-white pb-20">
      <Hero
        image={business.image}
        srcSet={responsiveSrcSet(business.image, [640, 960, 1280, 1600])}
        heightClass="h-[52vh] min-h-[360px]"
      >
        <NavBar theme="light" variant="back" backTo={basePath} />
        <div className="absolute inset-x-0 bottom-8 px-6 sm:px-10">
          <p className="text-[11px] font-light uppercase tracking-[0.25em] text-white/70">
            {business.category} · {business.location}
          </p>
          <h1 className="mt-2 font-display text-[30px] text-white sm:text-[42px]">
            {business.name}
          </h1>
        </div>
      </Hero>

      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-[17px] font-light leading-relaxed text-[#1d1d1f] sm:text-[19px]">
          {business.tagline}
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
          {business.description}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-neutral-100 pt-10 sm:grid-cols-3">
          <div>
            <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Hours
            </h3>
            <ul className="mt-3 space-y-1.5">
              {business.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4 text-[13px] text-[#1d1d1f]">
                  <span className="text-neutral-500">{h.day}</span>
                  <span>{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Contact
            </h3>
            <div className="mt-3 space-y-1.5 text-[13px] text-[#1d1d1f]">
              <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="block hover:underline">
                {business.phone}
              </a>
              <p className="text-neutral-500">{business.address}</p>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Directions
            </h3>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] hover:underline"
            >
              Get Directions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="mb-4 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            Gallery
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {business.gallery.map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-xl bg-neutral-100 ${
                  i === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'
                }`}
              >
                <img
                  src={src}
                  srcSet={responsiveSrcSet(src, i === 0 ? [700, 1000, 1400] : [380, 570, 760])}
                  sizes={i === 0 ? '(min-width: 640px) 700px, 100vw' : '(min-width: 640px) 380px, 45vw'}
                  alt={`${business.name} photo ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Hero from '../components/Hero';
import NavBar from '../components/NavBar';
import GalleryLightbox from '../components/GalleryLightbox';
import CarIcon from '../components/CarIcon';
import BusinessLocationMap from '../components/BusinessLocationMap';
import WhatsOnSection from '../components/WhatsOnSection';
import MenuAndBooking from '../components/MenuAndBooking';
import RoomServiceNote from '../components/RoomServiceNote';
import {
  getBusinessById,
  responsiveSrcSet,
  todaysHours,
  formatWebsiteLabel,
  eatAndDrink,
  thingsToDo,
} from '../data/businesses';
import { contactInfo } from '../data/hotelInfo';

/** Swipe must be this far, and this much more horizontal than vertical, to count as a page-to-page swipe. */
const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_DIRECTION_RATIO = 1.5;

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-neutral-400">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-neutral-400">
      <path
        d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-neutral-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-neutral-400">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const business = id ? getBusinessById(id) : undefined;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [id]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [id]);

  if (!business) return <Navigate to="/" replace />;

  const basePath = business.type === 'eat-drink' ? '/eat-drink' : '/things-to-do';
  const sectionTitle = business.type === 'eat-drink' ? 'Eat & Drink' : 'Things To Do';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    contactInfo.address
  )}&destination=${encodeURIComponent(`${business.name}, ${business.address}`)}`;

  const isNearby = business.location !== 'In-Hotel';
  const driveTimeLabel = isNearby ? `${business.minutesFromHotel} Min Drive` : 'On-Site';
  const todays = todaysHours(business);

  // Swipe left/right moves between businesses within the same category
  // (Eat & Drink or Things To Do), in the same order they're listed on that
  // category's page.
  const categoryList = business.type === 'eat-drink' ? eatAndDrink : thingsToDo;
  const categoryIndex = categoryList.findIndex((b) => b.id === business.id);
  const prevBusiness = categoryIndex > 0 ? categoryList[categoryIndex - 1] : null;
  const nextBusiness = categoryIndex < categoryList.length - 1 ? categoryList[categoryIndex + 1] : null;

  function handleTouchStart(e: React.TouchEvent) {
    // Swiping open the photo lightbox or panning the embedded map has its
    // own, more specific gesture handling — don't fight it for the touch.
    if (lightboxIndex !== null) return;
    if ((e.target as HTMLElement).closest('.maplibregl-map')) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return;

    const target = dx < 0 ? nextBusiness : prevBusiness;
    if (target) navigate(`${basePath}/${target.id}`);
  }

  return (
    <div
      className={`min-h-screen pb-20 ${isNearby ? 'bg-white' : 'bg-[#edd9ca]'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Hero
        image={business.image.url}
        srcSet={responsiveSrcSet(business.image.url, [640, 960, 1280, 1600], business.image.upscale)}
        objectPosition={business.image.position}
        heightClass="h-[52vh] min-h-[360px]"
      >
        <NavBar theme="light" variant="back" backTo={basePath} title={sectionTitle} scrolled={scrolled} />
        <div className="absolute inset-x-0 bottom-8 flex items-end justify-between gap-4 px-6 sm:px-10">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.25em] text-white/70">
              {isNearby && <CarIcon />}
              {driveTimeLabel}
            </p>
            <h1 className="mt-2 font-display text-[30px] text-white sm:text-[42px]">
              {business.name}
            </h1>
          </div>

          {categoryList.length > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => prevBusiness && navigate(`${basePath}/${prevBusiness.id}`)}
                disabled={!prevBusiness}
                aria-label={`Previous ${sectionTitle} business`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors ${
                  prevBusiness ? 'cursor-pointer hover:bg-white/25' : 'cursor-default opacity-30'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => nextBusiness && navigate(`${basePath}/${nextBusiness.id}`)}
                disabled={!nextBusiness}
                aria-label={`Next ${sectionTitle} business`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors ${
                  nextBusiness ? 'cursor-pointer hover:bg-white/25' : 'cursor-default opacity-30'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Hero>

      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-[17px] font-light leading-relaxed text-[#1d1d1f] sm:text-[19px]">
          {business.tagline}
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
          {business.description}
        </p>

        {business.id === 'live-entertainment' && <WhatsOnSection />}
        {business.id === 'the-beachie-bar-and-bistro' && <MenuAndBooking businessId={business.id} />}
        {business.id === 'the-beachie-bar-and-bistro' && (
          <div className="mt-8">
            <RoomServiceNote />
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-neutral-100 bg-neutral-50/60 px-6 py-6 sm:px-8 sm:py-7">
          <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            Hours
          </h3>

          <ul className="-mx-3 mt-2">
            {business.hours.map((h) => {
              const isToday = todays.includes(h);
              return (
                <li
                  key={h.day}
                  className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-[13px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:py-2 ${
                    isToday ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : ''
                  }`}
                >
                  <span className={`flex items-center gap-2 ${isToday ? 'font-medium text-[#567791]' : 'text-neutral-500'}`}>
                    {h.day}
                    {isToday && (
                      <span className="rounded-full bg-[#567791]/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#567791]">
                        Today
                      </span>
                    )}
                  </span>
                  <span
                    className={`sm:text-right ${
                      isToday ? 'font-semibold text-[#1d1d1f]' : 'font-medium text-neutral-500'
                    }`}
                  >
                    {h.hours}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="my-6 border-t border-neutral-200/70" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-2.5 text-[14px] font-medium text-[#1d1d1f] hover:underline"
                >
                  <PhoneIcon />
                  {business.phone}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 break-all text-[14px] font-medium text-[#1d1d1f] hover:underline"
                >
                  <GlobeIcon />
                  {formatWebsiteLabel(business.website)}
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-start gap-2.5 break-all text-[14px] font-medium text-[#1d1d1f] hover:underline"
                >
                  <MailIcon />
                  {business.email}
                </a>
              )}
              <p className="flex items-start gap-2.5 text-[13px] text-neutral-500">
                <PinIcon />
                <span>{business.address}</span>
              </p>
            </div>

            <div className="space-y-2 sm:text-right">
              <p className="flex items-center gap-1.5 text-[13px] text-neutral-500 sm:justify-end">
                {isNearby && <CarIcon />}
                {driveTimeLabel}
              </p>
              {isNearby && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1d1d1f] hover:underline"
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
              )}
            </div>
          </div>
        </div>

        {business.lat !== undefined && business.lng !== undefined && (
          <div className="mt-14">
            <h3 className="mb-4 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Location
            </h3>
            <BusinessLocationMap business={business as typeof business & { lat: number; lng: number }} />
          </div>
        )}

        {business.gallery.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-4 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Gallery
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {business.gallery.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open photo ${i + 1} of ${business.gallery.length}`}
                  className="group aspect-square cursor-pointer overflow-hidden rounded-xl bg-neutral-100"
                >
                  <img
                    src={img.url}
                    srcSet={responsiveSrcSet(img.url, [380, 570, 760], img.upscale)}
                    sizes="(min-width: 640px) 380px, 45vw"
                    alt={`${business.name} photo ${i + 1}`}
                    loading="lazy"
                    draggable={false}
                    style={{ objectPosition: img.position }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 border-t border-black/5 pt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.15em] text-[#1d1d1f]/40 underline decoration-[#1d1d1f]/20 underline-offset-4 transition-colors hover:text-[#1d1d1f] hover:decoration-[#1d1d1f]/50"
          >
            Part of The Beachcomber Hotel &amp; Resort Guide
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={business.gallery.map((img) => img.url)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
          altPrefix={business.name}
        />
      )}
    </div>
  );
}

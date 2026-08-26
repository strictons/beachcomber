import NavBar from '../components/NavBar';
import BusinessCard from '../components/BusinessCard';
import type { Business } from '../data/businesses';

export default function BusinessList({
  title,
  businesses,
  basePath,
  twoColumnInHotel = false,
  fullWidthInHotelIds = [],
}: {
  title: string;
  businesses: Business[];
  basePath: string;
  /** Show the "Inside the Hotel" grid as 2 columns even on mobile, instead of 1. */
  twoColumnInHotel?: boolean;
  /** Business ids that should span both columns of the "Inside the Hotel" grid. */
  fullWidthInHotelIds?: string[];
}) {
  const inHotel = businesses.filter((b) => b.location === 'In-Hotel');
  const nearby = businesses.filter((b) => b.location === 'Nearby');

  const sectionTitleClass =
    'font-heading text-[15px] font-normal uppercase tracking-[0.06em] text-[#1d1d1f]/45 sm:text-[19px] sm:tracking-[0.08em]';

  return (
    <div className="min-h-screen bg-white">
      <NavBar theme="dark" sticky title={title} />

      {inHotel.length > 0 && (
        <section className="bg-[#edd9ca]">
          <div className="mx-auto max-w-5xl px-6 pb-10 pt-8 sm:px-10 sm:pb-14 sm:pt-10">
            <h2 className={`mb-5 sm:mb-6 ${sectionTitleClass}`}>Inside the Hotel</h2>
            <div
              className={`grid gap-y-6 sm:grid-cols-2 sm:gap-x-6 ${
                twoColumnInHotel ? 'grid-cols-2 gap-x-4' : 'grid-cols-1 gap-x-6'
              }`}
            >
              {inHotel.map((b, i) => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  basePath={basePath}
                  priority={i < 2}
                  className={fullWidthInHotelIds.includes(b.id) ? 'col-span-2' : ''}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
            <h2 className={`mb-5 sm:mb-6 ${sectionTitleClass}`}>Outside the Hotel</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {nearby.map((b) => (
                <BusinessCard key={b.id} business={b} basePath={basePath} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

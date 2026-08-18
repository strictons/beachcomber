import NavBar from '../components/NavBar';
import BusinessCard from '../components/BusinessCard';
import type { Business } from '../data/businesses';

export default function BusinessList({
  title,
  businesses,
  basePath,
}: {
  title: string;
  businesses: Business[];
  basePath: string;
}) {
  const inHotel = businesses.filter((b) => b.location === 'In-Hotel');
  const nearby = businesses.filter((b) => b.location === 'Nearby');

  return (
    <div className="min-h-screen bg-white">
      <NavBar theme="dark" sticky title={title} />

      <div className="mx-auto max-w-5xl px-6 pb-10 pt-8 sm:px-10 sm:pb-14 sm:pt-10">
        {inHotel.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              In the Hotel
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {inHotel.map((b, i) => (
                <BusinessCard key={b.id} business={b} basePath={basePath} priority={i < 2} />
              ))}
            </div>
          </section>
        )}

        {nearby.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Nearby
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {nearby.map((b) => (
                <BusinessCard key={b.id} business={b} basePath={basePath} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

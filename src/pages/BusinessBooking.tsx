import { useParams, Navigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getBusinessById } from '../data/businesses';
import { businessBookingUrls } from '../data/booking';

export default function BusinessBooking() {
  const { id } = useParams<{ id: string }>();
  const business = id ? getBusinessById(id) : undefined;
  const bookingUrl = id ? businessBookingUrls[id] : undefined;

  if (!business || !bookingUrl) return <Navigate to="/" replace />;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#edd9ca]">
      <NavBar theme="dark" sticky variant="back" backTo={`/eat-drink/${business.id}`} />

      <div className="shrink-0 border-b border-black/5 bg-[#edd9ca] px-6 py-3 sm:px-10">
        <p className="truncate font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-[#1d1d1f]/45">
          {business.name}
        </p>
        <h1 className="font-display text-[20px] text-[#1d1d1f]">Book a Table</h1>
      </div>

      <div className="relative flex-1 px-4 pb-4 sm:px-10 sm:pb-10">
        <div className="h-full w-full overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <iframe src={bookingUrl} title={`Book a table at ${business.name}`} className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}

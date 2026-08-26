import { Link } from 'react-router-dom';

/** Food/Drinks menu buttons and a link through to the booking page for The Beachie Bar and Bistro. */
export default function MenuAndBooking({ businessId }: { businessId: string }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3">
      <Link
        to={`/eat-drink/${businessId}/menu/food`}
        className="whitespace-nowrap rounded-xl bg-[#A7E5FF] px-3 py-3.5 text-center font-heading text-[11px] font-medium uppercase tracking-[0.03em] text-[#1d1d1f] transition-colors hover:bg-[#A7E5FF]/80 sm:px-5 sm:text-[12px] sm:tracking-[0.1em]"
      >
        Food Menu
      </Link>
      <Link
        to={`/eat-drink/${businessId}/menu/drinks`}
        className="whitespace-nowrap rounded-xl bg-[#FFCA54] px-3 py-3.5 text-center font-heading text-[11px] font-medium uppercase tracking-[0.03em] text-[#1d1d1f] transition-colors hover:bg-[#FFCA54]/80 sm:px-5 sm:text-[12px] sm:tracking-[0.1em]"
      >
        Drinks Menu
      </Link>
      <Link
        to={`/eat-drink/${businessId}/book`}
        className="col-span-2 rounded-xl bg-[#1d1d1f] px-5 py-3.5 text-center font-heading text-[12px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#1d1d1f]/90"
      >
        Book a Table
      </Link>
    </div>
  );
}

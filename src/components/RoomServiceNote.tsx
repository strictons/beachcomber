import { contactInfo } from '../data/hotelInfo';

function PhoneIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
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

/** Room Service call-out with hours, used on both the bistro's page and its menu pages. */
export default function RoomServiceNote() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#567791]/15 bg-[#567791]/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#567791]/15 text-[#567791]">
          <PhoneIcon size={16} className="text-[#567791]" />
        </div>
        <div>
          <p className="text-[13px] leading-relaxed text-neutral-600">
            Ordering in? Dial <span className="font-semibold text-[#1d1d1f]">9</span> from your room phone for Room
            Service, or tap to call.
          </p>
          <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            Available from 11:00am to 9:00pm
          </p>
        </div>
      </div>
      <a
        href={`tel:${contactInfo.phone.replace(/[^\d+]/g, '')}`}
        className="flex shrink-0 items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1d1d1f]/90"
      >
        <PhoneIcon size={12} className="text-white" />
        Call {contactInfo.phone}
      </a>
    </div>
  );
}

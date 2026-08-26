import { useState } from 'react';
import {
  featuredEvents,
  weeklyEvents,
  liveEntertainmentWidgetUrl,
  liveSportsWidgets,
  type FeaturedEvent,
  type WeeklyEvent,
} from '../data/events';

type Tab = 'featured' | 'weekly' | 'entertainment' | 'sports';

const TABS: { id: Tab; label: string }[] = [
  { id: 'featured', label: 'Featured Events' },
  { id: 'weekly', label: 'Weekly Events' },
  { id: 'entertainment', label: 'Live Entertainment' },
  { id: 'sports', label: 'Live Sports' },
];

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 17L17 7M17 7H8M17 7V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EventTile({ event }: { event: FeaturedEvent | WeeklyEvent }) {
  return (
    <div className="rounded-xl bg-white p-3">
      {event.image && (
        <img src={event.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
      )}
      <p className="mt-3 font-heading text-[12px] font-semibold tracking-[0.04em] text-[#1d1d1f]">{event.title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{event.description}</p>
      {'url' in event && event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#567791] hover:underline"
        >
          Find Out More
          <ArrowIcon />
        </a>
      )}
    </div>
  );
}

function WidgetFrame({ src, height }: { src: string; height: number }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white" style={{ height }}>
      <iframe src={src} title="Beachcomber Hotel & Resort widget" className="h-full w-full border-0" />
    </div>
  );
}

/** Renders the Beachcomber's public "What's On" page — see scripts/sync-events.mjs for how this is synced. */
export default function WhatsOnSection() {
  const [tab, setTab] = useState<Tab>('featured');

  return (
    <div className="mt-10 rounded-2xl border border-neutral-100 bg-neutral-50/60 px-6 py-6 sm:px-8 sm:py-7">
      <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">What's On</h3>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-2 py-1.5 text-center font-heading text-[10px] font-medium uppercase tracking-[0.04em] transition-colors sm:px-3.5 sm:text-[11px] sm:tracking-[0.06em] ${
              tab === t.id ? 'bg-[#1d1d1f] text-white' : 'bg-white text-neutral-500 hover:bg-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'featured' &&
          (featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventTile key={event.title} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-neutral-500">Nothing featured right now — check back soon.</p>
          ))}

        {tab === 'weekly' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {weeklyEvents.map((event) => (
              <EventTile key={event.title} event={event} />
            ))}
          </div>
        )}

        {tab === 'entertainment' && <WidgetFrame src={liveEntertainmentWidgetUrl} height={560} />}

        {tab === 'sports' && (
          <div className="space-y-4">
            <WidgetFrame src={liveSportsWidgets.carouselUrl} height={445} />
            <WidgetFrame src={liveSportsWidgets.fullUrl} height={560} />
          </div>
        )}
      </div>
    </div>
  );
}

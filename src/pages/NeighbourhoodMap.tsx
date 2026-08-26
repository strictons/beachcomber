import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  NavigationControl,
  LngLatBounds,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import NavBar from '../components/NavBar';
import CarIcon from '../components/CarIcon';
import CategoryIcon from '../components/CategoryIcon';
import { allBusinesses, responsiveSrcSet, type Business, type BusinessType } from '../data/businesses';
import { contactInfo } from '../data/hotelInfo';
import {
  MAP_STYLE,
  CATEGORY_COLOR,
  HOTEL_COLOR,
  createPinElement,
  panPopupIntoView,
  collapseAttribution,
  deferredUnmount,
  type NearbyBusiness,
} from '../utils/mapPins';

type Filter = 'all' | BusinessType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'eat-drink', label: 'Eat & Drink' },
  { id: 'things-to-do', label: 'Things To Do' },
];

const nearby = allBusinesses.filter(
  (b): b is Business & { lat: number; lng: number } => b.lat !== undefined && b.lng !== undefined
);

const inHotelBusinesses = allBusinesses.filter((b) => b.location === 'In-Hotel');

/** Pins whose screen positions land within this many pixels of each other are grouped into a cluster badge. */
const CLUSTER_PIXEL_RADIUS = 42;

/**
 * Groups points whose current screen positions are within `pixelRadius` of
 * one another (transitively — a chain of near neighbours forms one group),
 * so pins that would otherwise stack illegibly at a given zoom level can be
 * shown as a single cluster badge instead. Recomputed on every zoom change,
 * since the same coordinates spread apart or collapse together as the
 * projection scale changes.
 */
function computeClusters(m: MapLibreMap, points: NearbyBusiness[], pixelRadius: number): NearbyBusiness[][] {
  const projected = points.map((b) => ({ b, pt: m.project([b.lng, b.lat]) }));
  const visited = new Array(projected.length).fill(false);
  const groups: NearbyBusiness[][] = [];

  for (let i = 0; i < projected.length; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const stack = [i];
    const group: NearbyBusiness[] = [];

    while (stack.length > 0) {
      const idx = stack.pop()!;
      group.push(projected[idx].b);
      for (let j = 0; j < projected.length; j++) {
        if (visited[j]) continue;
        const dx = projected[j].pt.x - projected[idx].pt.x;
        const dy = projected[j].pt.y - projected[idx].pt.y;
        if (Math.hypot(dx, dy) <= pixelRadius) {
          visited[j] = true;
          stack.push(j);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

/** Solid category color if every pin in the cluster shares one, otherwise a half-and-half split of both. */
function clusterBackground(group: NearbyBusiness[]): string {
  const types = [...new Set(group.map((b) => b.type))];
  if (types.length === 1) return CATEGORY_COLOR[types[0]];
  return `conic-gradient(${CATEGORY_COLOR['eat-drink']} 0deg 180deg, ${CATEGORY_COLOR['things-to-do']} 180deg 360deg)`;
}

/**
 * A round badge standing in for a group of pins too close together to show
 * individually. The count sits in its own small circle at the top-right
 * corner, clear of the main badge's color so a mixed-category split fill
 * stays fully visible. Uses the same off-element hover trick as
 * createPinElement.
 */
function createClusterElement(background: string, count: number): HTMLDivElement {
  const size = 40;
  const el = document.createElement('div');
  el.style.cursor = 'pointer';

  const inner = document.createElement('div');
  inner.className = 'bch-cluster';
  inner.style.position = 'relative';
  inner.style.width = `${size}px`;
  inner.style.height = `${size}px`;
  inner.style.transition = 'transform 0.15s ease';
  inner.innerHTML = `
    <div style="
      width:100%; height:100%; border-radius:9999px;
      background:${background}; border:3px solid white;
      box-shadow: 0 4px 12px -2px rgba(0,0,0,0.45);
    "></div>
    <div style="
      position:absolute; top:-6px; right:-6px;
      min-width:20px; height:20px; padding:0 5px; box-sizing:border-box;
      border-radius:9999px; background:${HOTEL_COLOR}; border:2px solid white;
      box-shadow: 0 2px 6px -1px rgba(0,0,0,0.4);
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="font-family:var(--font-heading); font-weight:700; color:white; font-size:11px; line-height:1;">${count}</span>
    </div>
  `;
  el.appendChild(inner);

  el.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.1)';
  });
  el.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1)';
  });
  return el;
}

function PopupCard({ business, onView }: { business: Business; onView: () => void }) {
  const basePath = business.type === 'eat-drink' ? '/eat-drink' : '/things-to-do';
  return (
    <div className="w-[248px]">
      <a
        href={`${basePath}/${business.id}`}
        onClick={(e) => {
          e.preventDefault();
          onView();
        }}
        className="flex gap-3 p-3"
      >
        <img
          src={business.image.url}
          srcSet={responsiveSrcSet(business.image.url, [120, 180])}
          sizes="64px"
          alt={business.name}
          style={{ objectPosition: business.image.position }}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            {business.category}
          </p>
          <p className="mt-0.5 truncate font-heading text-[14px] font-medium text-[#1d1d1f]">{business.name}</p>
          {business.minutesFromHotel !== undefined && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
              <CarIcon className="shrink-0 text-neutral-400" />
              {business.minutesFromHotel} Min Drive
            </p>
          )}
        </div>
      </a>
      <a
        href={`${basePath}/${business.id}`}
        onClick={(e) => {
          e.preventDefault();
          onView();
        }}
        className="flex items-center justify-center gap-1.5 border-t border-black/[0.06] py-2.5 font-heading text-[11px] font-medium uppercase tracking-[0.1em] text-[#1d1d1f] hover:bg-black/[0.02]"
      >
        View Details
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 17L17 7M17 7H8M17 7V16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}

function HotelPopupCard() {
  return (
    <div className="w-[240px] p-4">
      <p className="font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        You're Staying Here
      </p>
      <p className="mt-1 font-display text-[17px] leading-tight text-[#1d1d1f]">
        The Beachcomber Hotel &amp; Resort
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{contactInfo.address}</p>

      <div className="mt-3 border-t border-black/[0.06] pt-3">
        <p className="font-heading text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400">On-Site</p>
        <ul className="mt-1.5 space-y-1">
          {inHotelBusinesses.map((b) => (
            <li key={b.id} className="text-[12px] leading-snug text-[#1d1d1f]">
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function NeighbourhoodMap() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const popupRoots = useRef<Root[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new MapLibreMap({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [contactInfo.lng, contactInfo.lat],
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
      attributionControl: { compact: true },
    });
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    m.on('styledata', () => collapseAttribution(m));
    map.current = m;

    const resizeObserver = new ResizeObserver(() => m.resize());
    resizeObserver.observe(mapContainer.current);

    const hotelEl = createPinElement(HOTEL_COLOR, 'hotel', 38);
    const hotelMarker = new Marker({ element: hotelEl, anchor: 'bottom' })
      .setLngLat([contactInfo.lng, contactInfo.lat])
      .addTo(m);

    const hotelPopupContainer = document.createElement('div');
    const hotelPopupRoot = createRoot(hotelPopupContainer);
    hotelPopupRoot.render(<HotelPopupCard />);
    const hotelPopup = new Popup({ offset: 28, className: 'bch-popup', closeButton: false }).setDOMContent(
      hotelPopupContainer
    );
    hotelPopup.on('open', () => {
      requestAnimationFrame(() => panPopupIntoView(m, hotelPopup.getElement()));
    });
    hotelMarker.setPopup(hotelPopup);

    return () => {
      resizeObserver.disconnect();
      deferredUnmount(hotelPopupRoot);
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const visible = filter === 'all' ? nearby : nearby.filter((b) => b.type === filter);

    function addBusinessMarker(business: NearbyBusiness) {
      const el = createPinElement(CATEGORY_COLOR[business.type], business.type, 36);
      const marker = new Marker({ element: el, anchor: 'bottom' }).setLngLat([business.lng, business.lat]).addTo(m!);

      const container = document.createElement('div');
      const popup = new Popup({ offset: 24, className: 'bch-popup', maxWidth: '260px' }).setDOMContent(container);
      popup.on('open', () => {
        requestAnimationFrame(() => panPopupIntoView(m!, popup.getElement()));
      });

      // Rendered once up front (rather than on each 'open') so repainting
      // markers on zoom never has to unmount a root mid-render — a shared,
      // recreated-on-open root was racing with the zoom-triggered repaint.
      const root = createRoot(container);
      popupRoots.current.push(root);
      root.render(
        <PopupCard
          business={business}
          onView={() => {
            popup.remove();
            navigate(`${business.type === 'eat-drink' ? '/eat-drink' : '/things-to-do'}/${business.id}`);
          }}
        />
      );

      marker.setPopup(popup);
      markers.current.push(marker);
    }

    function addClusterMarker(group: NearbyBusiness[]) {
      const centerLng = group.reduce((sum, b) => sum + b.lng, 0) / group.length;
      const centerLat = group.reduce((sum, b) => sum + b.lat, 0) / group.length;

      const el = createClusterElement(clusterBackground(group), group.length);
      const marker = new Marker({ element: el, anchor: 'center' }).setLngLat([centerLng, centerLat]).addTo(m!);

      el.addEventListener('click', () => {
        const clusterBounds = new LngLatBounds();
        group.forEach((b) => clusterBounds.extend([b.lng, b.lat]));
        m!.fitBounds(clusterBounds, { padding: 90, maxZoom: 18, duration: 500 });
      });

      markers.current.push(marker);
    }

    // Re-clusters against the map's current zoom. Skipped when the grouping
    // hasn't actually changed, so casual pinch/scroll zooming doesn't churn
    // through (and flicker) markers or close an open popup for no reason.
    let lastSignature: string | null = null;
    function paintMarkers() {
      const groups = computeClusters(m!, visible, CLUSTER_PIXEL_RADIUS);
      const signature = groups
        .map((group) =>
          group
            .map((b) => b.id)
            .sort()
            .join('+')
        )
        .sort()
        .join('|');
      if (signature === lastSignature) return;
      lastSignature = signature;

      markers.current.forEach((mk) => mk.remove());
      markers.current = [];
      popupRoots.current.forEach(deferredUnmount);
      popupRoots.current = [];

      groups.forEach((group) => (group.length === 1 ? addBusinessMarker(group[0]) : addClusterMarker(group)));
    }

    const bounds = new LngLatBounds();
    bounds.extend([contactInfo.lng, contactInfo.lat]);
    visible.forEach((b) => bounds.extend([b.lng, b.lat]));
    m.fitBounds(bounds, { padding: { top: 70, bottom: 70, left: 50, right: 50 }, maxZoom: 14, duration: 0 });

    paintMarkers();
    m.on('zoomend', paintMarkers);

    return () => {
      m.off('zoomend', paintMarkers);
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];
      popupRoots.current.forEach(deferredUnmount);
      popupRoots.current = [];
    };
  }, [filter, navigate]);

  return (
    <div className="flex h-[100dvh] flex-col bg-[#edd9ca]">
      <NavBar theme="dark" sticky title="Neighbourhood Map" />

      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-black/5 bg-[#edd9ca] px-6 py-3 sm:px-10">
        {FILTERS.map((f) => {
          const active = filter === f.id;

          if (f.id === 'all') {
            return (
              <button
                key={f.id}
                onClick={() => setFilter('all')}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] transition-colors sm:text-[12px] ${
                  active ? 'bg-[#1d1d1f] text-white' : 'bg-white/70 text-[#1d1d1f]/60 hover:bg-white'
                }`}
              >
                {f.label}
              </button>
            );
          }

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{ background: CATEGORY_COLOR[f.id] }}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-opacity sm:text-[12px] ${
                active ? 'opacity-100 shadow-[0_3px_10px_-3px_rgba(0,0,0,0.4)]' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <CategoryIcon type={f.id} className="h-3 w-3 shrink-0" />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 px-6 pb-6 sm:px-10 sm:pb-10">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Map as MapLibreMap, Marker, Popup, NavigationControl, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import CarIcon from './CarIcon';
import { type Business } from '../data/businesses';
import { contactInfo } from '../data/hotelInfo';
import {
  MAP_STYLE,
  CATEGORY_COLOR,
  HOTEL_COLOR,
  createPinElement,
  panPopupIntoView,
  collapseAttribution,
  deferredUnmount,
} from '../utils/mapPins';

function HotelPopupCard() {
  return (
    <div className="w-[220px] p-4">
      <p className="font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        You're Staying Here
      </p>
      <p className="mt-1 font-display text-[16px] leading-tight text-[#1d1d1f]">The Beachcomber Hotel &amp; Resort</p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{contactInfo.address}</p>
    </div>
  );
}

function BusinessPopupCard({ business }: { business: Business & { lat: number; lng: number } }) {
  return (
    <div className="w-[220px] p-4">
      <p className="font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        {business.category}
      </p>
      <p className="mt-1 font-display text-[16px] leading-tight text-[#1d1d1f]">{business.name}</p>
      {business.minutesFromHotel !== undefined && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-neutral-500">
          <CarIcon className="shrink-0 text-neutral-400" />
          {business.minutesFromHotel} Min Drive
        </p>
      )}
    </div>
  );
}

export default function BusinessLocationMap({ business }: { business: Business & { lat: number; lng: number } }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new MapLibreMap({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [business.lng, business.lat],
      zoom: 12,
      minZoom: 8,
      maxZoom: 18,
      cooperativeGestures: true,
      attributionControl: { compact: true },
    });
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    m.on('styledata', () => collapseAttribution(m));
    map.current = m;

    const resizeObserver = new ResizeObserver(() => m.resize());
    resizeObserver.observe(mapContainer.current);
    // Some browsers don't reliably fire ResizeObserver for every layout
    // change (e.g. a container resized only via a viewport/orientation
    // change), which can leave the canvas stuck at a stale size — resize on
    // these too as a fallback so it can't get permanently out of sync.
    const handleWindowResize = () => m.resize();
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    const popupRoots: Root[] = [];

    const hotelEl = createPinElement(HOTEL_COLOR, 'hotel', 34);
    const hotelMarker = new Marker({ element: hotelEl, anchor: 'bottom' })
      .setLngLat([contactInfo.lng, contactInfo.lat])
      .addTo(m);
    const hotelPopupContainer = document.createElement('div');
    const hotelPopupRoot = createRoot(hotelPopupContainer);
    popupRoots.push(hotelPopupRoot);
    hotelPopupRoot.render(<HotelPopupCard />);
    const hotelPopup = new Popup({ offset: 26, className: 'bch-popup', closeButton: false }).setDOMContent(
      hotelPopupContainer
    );
    hotelPopup.on('open', () => {
      requestAnimationFrame(() => panPopupIntoView(m, hotelPopup.getElement()));
    });
    hotelMarker.setPopup(hotelPopup);

    const businessEl = createPinElement(CATEGORY_COLOR[business.type], business.type, 34);
    const businessMarker = new Marker({ element: businessEl, anchor: 'bottom' })
      .setLngLat([business.lng, business.lat])
      .addTo(m);
    const businessPopupContainer = document.createElement('div');
    const businessPopupRoot = createRoot(businessPopupContainer);
    popupRoots.push(businessPopupRoot);
    businessPopupRoot.render(<BusinessPopupCard business={business} />);
    const businessPopup = new Popup({ offset: 26, className: 'bch-popup', closeButton: false }).setDOMContent(
      businessPopupContainer
    );
    businessPopup.on('open', () => {
      requestAnimationFrame(() => panPopupIntoView(m, businessPopup.getElement()));
    });
    businessMarker.setPopup(businessPopup);

    const bounds = new LngLatBounds();
    bounds.extend([contactInfo.lng, contactInfo.lat]);
    bounds.extend([business.lng, business.lat]);
    m.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 50, right: 50 }, maxZoom: 15, duration: 0 });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      popupRoots.forEach(deferredUnmount);
      m.remove();
      map.current = null;
    };
  }, [business]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}

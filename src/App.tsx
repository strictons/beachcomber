import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuProvider } from './components/MenuContext';
import MenuOverlay from './components/MenuOverlay';
import ScanAnotherButton from './components/ScanAnotherButton';
import Home from './pages/Home';
import EatAndDrink from './pages/EatAndDrink';
import ThingsToDo from './pages/ThingsToDo';
import BusinessDetail from './pages/BusinessDetail';
import BusinessBooking from './pages/BusinessBooking';
import HotelInformation from './pages/HotelInformation';
import Landing from './pages/Landing';
import ScrollToTop from './components/ScrollToTop';

// Only the routes that pull a heavy dependency are code-split, so navigating
// between the everyday pages never waits on a JS round-trip:
//   - BusinessMenu    → pdfjs-dist (~1.2MB)
//   - NeighbourhoodMap → maplibre-gl (~600KB) via a static import
// (BusinessDetail's per-venue map is split separately, inside that page.)
const BusinessMenu = lazy(() => import('./pages/BusinessMenu'));
const NeighbourhoodMap = lazy(() => import('./pages/NeighbourhoodMap'));

// Each hotel's guide is mounted at its own path, reachable only via that
// property's physical QR code. Anything outside of a known prefix (the bare
// domain root included) gets the generic Landing page instead — it must
// never list or link to a specific hotel's guide.
const HOTEL_APP_BASES = ['/beachcomber-hotel-and-resort'];

function matchedHotelBase(pathname: string) {
  return HOTEL_APP_BASES.find((base) => pathname === base || pathname.startsWith(`${base}/`));
}

// index.html's static <title> has to describe the bundle as a whole (used
// for the Landing page too), so the hotel app sets its own once it mounts.
function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

// Neutral hold matching the app's page background while a split route's
// chunk loads.
function RouteFallback() {
  return <div className="min-h-[100dvh] bg-[#edd9ca]" />;
}

export default function App() {
  const hotelBase = matchedHotelBase(window.location.pathname);

  if (!hotelBase) return <Landing />;

  return (
    <BrowserRouter basename={hotelBase}>
      <MenuProvider>
        <DocumentTitle title="The Beachcomber Hotel and Resort" />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotel-information" element={<HotelInformation />} />
          <Route path="/eat-drink" element={<EatAndDrink />} />
          <Route path="/eat-drink/:id" element={<BusinessDetail />} />
          <Route
            path="/eat-drink/:id/menu/:type"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BusinessMenu />
              </Suspense>
            }
          />
          <Route path="/eat-drink/:id/book" element={<BusinessBooking />} />
          <Route path="/things-to-do" element={<ThingsToDo />} />
          <Route path="/things-to-do/:id" element={<BusinessDetail />} />
          <Route
            path="/map"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NeighbourhoodMap />
              </Suspense>
            }
          />
        </Routes>
        <MenuOverlay />
        <ScanAnotherButton />
      </MenuProvider>
    </BrowserRouter>
  );
}

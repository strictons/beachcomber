import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuProvider } from './components/MenuContext';
import MenuOverlay from './components/MenuOverlay';
import Home from './pages/Home';
import EatAndDrink from './pages/EatAndDrink';
import ThingsToDo from './pages/ThingsToDo';
import BusinessDetail from './pages/BusinessDetail';
import BusinessBooking from './pages/BusinessBooking';
import HotelInformation from './pages/HotelInformation';
import NeighbourhoodMap from './pages/NeighbourhoodMap';
import ScrollToTop from './components/ScrollToTop';

// Pulls in pdfjs-dist (~1.2MB), so it's kept out of the main bundle and only
// fetched by visitors who actually open a menu.
const BusinessMenu = lazy(() => import('./pages/BusinessMenu'));

export default function App() {
  return (
    <BrowserRouter basename="/beachcomber-hotel-and-resort">
      <MenuProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotel-information" element={<HotelInformation />} />
          <Route path="/eat-drink" element={<EatAndDrink />} />
          <Route path="/eat-drink/:id" element={<BusinessDetail />} />
          <Route
            path="/eat-drink/:id/menu/:type"
            element={
              <Suspense fallback={<div className="h-[100dvh] bg-[#edd9ca]" />}>
                <BusinessMenu />
              </Suspense>
            }
          />
          <Route path="/eat-drink/:id/book" element={<BusinessBooking />} />
          <Route path="/things-to-do" element={<ThingsToDo />} />
          <Route path="/things-to-do/:id" element={<BusinessDetail />} />
          <Route path="/map" element={<NeighbourhoodMap />} />
        </Routes>
        <MenuOverlay />
      </MenuProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuProvider } from './components/MenuContext';
import MenuOverlay from './components/MenuOverlay';
import Home from './pages/Home';
import EatAndDrink from './pages/EatAndDrink';
import ThingsToDo from './pages/ThingsToDo';
import BusinessDetail from './pages/BusinessDetail';
import HotelInformation from './pages/HotelInformation';
import NeighbourhoodMap from './pages/NeighbourhoodMap';
import ScrollToTop from './components/ScrollToTop';

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
          <Route path="/things-to-do" element={<ThingsToDo />} />
          <Route path="/things-to-do/:id" element={<BusinessDetail />} />
          <Route path="/map" element={<NeighbourhoodMap />} />
        </Routes>
        <MenuOverlay />
      </MenuProvider>
    </BrowserRouter>
  );
}

import {
  eatAndDrinkImages,
  thingsToDoImages,
  resolveImage,
  type BusinessImages,
  type PositionedImage,
} from './media';
import { contactInfo as hotelContactInfo } from './hotelInfo';

export type BusinessType = 'eat-drink' | 'things-to-do';

export interface Schedule {
  /** 0 = Sunday ... 6 = Saturday. Omitted = every day. */
  days?: number[];
  /** Minutes since midnight. */
  open: number;
  /** Minutes since midnight. If <= open, the schedule wraps past midnight. */
  close: number;
}

export interface Business {
  id: string;
  type: BusinessType;
  name: string;
  category: string;
  location: 'In-Hotel' | 'Nearby';
  /** Approximate distance from the hotel in kilometres. 0 for in-hotel venues. */
  distanceKm?: number;
  tagline: string;
  description: string;
  image: PositionedImage;
  gallery: PositionedImage[];
  hours: { day: string; hours: string }[];
  /** Structured hours for computing open/closed status. Undefined = hours unknown. */
  schedule?: Schedule[];
  phone?: string;
  address: string;
  /** Typical driving time in minutes from the hotel. Only set for Nearby businesses. */
  minutesFromHotel?: number;
  website?: string;
  email?: string;
  /** Coordinates for the Neighbourhood Map. Only set for Nearby businesses. */
  lat?: number;
  lng?: number;
}

/** Strips the protocol/www/trailing slash from a URL for compact display, e.g. "example.com". */
export function formatWebsiteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayIndex(token: string): number | null {
  const key = token.trim().slice(0, 3).toLowerCase();
  const idx = WEEKDAYS.findIndex((d) => d.toLowerCase() === key);
  return idx === -1 ? null : idx;
}

/** Whether a label like "Every day", "Monday" or "Tue – Sun" covers the given weekday (0 = Sun). */
function labelCoversDay(label: string, dayIdx: number): boolean {
  if (/every day/i.test(label)) return true;
  const [startToken, endToken] = label.split('–').map((s) => s.trim());
  const start = dayIndex(startToken);
  if (start === null) return false;
  if (!endToken) return start === dayIdx;
  const end = dayIndex(endToken);
  if (end === null) return start === dayIdx;
  return start <= end ? dayIdx >= start && dayIdx <= end : dayIdx >= start || dayIdx <= end;
}

/**
 * The hours entries relevant to today, for a compact "today's hours" summary.
 * Falls back to the full list if nothing matches (shouldn't normally happen).
 */
export function todaysHours(business: Business): { day: string; hours: string }[] {
  const todayIdx = new Date().getDay();
  const matches = business.hours.filter((h) => labelCoversDay(h.day, todayIdx));
  return matches.length > 0 ? matches : business.hours;
}

/** Looks up a business's hero/gallery photos in media.ts by id and merges them in. */
function withImages(
  business: Omit<Business, 'image' | 'gallery'>,
  images: Record<string, BusinessImages>
): Business {
  const media = images[business.id];
  if (!media) {
    throw new Error(`No images found in src/data/media.ts for business "${business.id}"`);
  }
  return { ...business, image: resolveImage(media.hero), gallery: media.gallery.map(resolveImage) };
}

const eatAndDrinkBase: Omit<Business, 'image' | 'gallery'>[] = [
  {
    id: 'the-beachie-bar-and-bistro',
    type: 'eat-drink',
    name: 'The Beachie Bar and Bistro',
    category: 'Bar & Bistro',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Pub classics and cocktails right on the water.',
    description:
      "Our bar and bistro serves delicious pub classics including burgers, steaks, seafood and wood-fired pizzas, paired with your favourite beers, wines and cocktails — a fantastic spot to grab a seat and enjoy dinner by the water.",
    hours: [{ day: 'Every day', hours: '11:00 AM – Late' }],
    schedule: [{ open: 11 * 60, close: 60 }],
    address: 'Level 3, The Beachcomber Hotel and Resort',
  },
  {
    id: 'pelicans-restaurant',
    type: 'eat-drink',
    name: 'Pelicans Restaurant',
    category: 'Restaurant',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Home to our daily breakfast buffet.',
    description:
      'Pelicans is home to our daily breakfast buffet, serving hot and continental favourites with barista-made coffee to start your day. On select dates, it also opens for exclusive dining experiences, hosting wine tastings and special events.',
    hours: [{ day: 'Breakfast, every day', hours: '7:00 AM – 10:00 AM' }],
    schedule: [{ open: 7 * 60, close: 10 * 60 }],
    phone: '(02) 4317 2845',
    address: 'Level 3, The Beachcomber Hotel and Resort',
    website: hotelContactInfo.website,
    email: hotelContactInfo.email,
  },
  {
    id: 'bbs-soul-kitchen',
    type: 'eat-drink',
    name: "BB's Soul Kitchen",
    category: 'American Soul Food',
    location: 'Nearby',
    distanceKm: 0.5,
    tagline: 'A taste of the American South in Toukley.',
    description:
      "BB's Soul Kitchen brings the rich flavours and warm hospitality of the American South to the Central Coast. Blending traditional soul food with a modern Australian touch, the menu showcases locally sourced ingredients, slow-cooked classics and thoughtfully crafted seasonal dishes. Whether you're stopping in for a casual lunch or settling in for a more intimate dinner, expect bold flavours, generous portions and a welcoming atmosphere.",
    hours: [
      { day: 'Monday', hours: 'Closed' },
      { day: 'Tue – Wed', hours: '5:00 PM – 9:00 PM' },
      { day: 'Thursday', hours: '5:00 PM – 10:00 PM' },
      { day: 'Fri – Sat', hours: '12:00 PM – 10:00 PM' },
      { day: 'Sunday', hours: '5:00 PM – 8:00 PM' },
    ],
    phone: '0412 190 124',
    address: '5/243-245 Main Rd, Toukley',
    minutesFromHotel: 2,
    website: 'https://www.bbsoulkitchen.com.au/',
    email: 'contact@bbsoulkitchen.com.au',
    lat: -33.26405,
    lng: 151.5407,
  },
  {
    id: 'johnny-tapas',
    type: 'eat-drink',
    name: 'Johnny Tapas',
    category: 'Mediterranean',
    location: 'Nearby',
    distanceKm: 4,
    tagline: 'Modern Mediterranean tapas and cocktails.',
    description:
      'A modern Mediterranean restaurant serving tapas-style share plates, wood-fired favourites and cocktails.',
    hours: [
      { day: 'Mon – Tue', hours: 'Closed' },
      { day: 'Wed – Fri', hours: '5:00 PM – 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM – 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM – 8:00 PM' },
    ],
    phone: '(02) 4396 4656',
    address: '7 Mitchell St, Norah Head',
    minutesFromHotel: 7,
    website: 'https://www.johnnytapas.com.au/',
    email: 'bookings@johnnytapas.com.au',
    lat: -33.2793851,
    lng: 151.5651967,
  },
  {
    id: 'motel-mezza',
    type: 'eat-drink',
    name: 'Motel Mezza',
    category: 'Middle Eastern',
    location: 'Nearby',
    distanceKm: 7,
    tagline: 'Middle Eastern food and cocktails with a retro motel feel.',
    description:
      'Middle Eastern food and cocktails in a social bar designed to feel like the lobby of a 1930s motel.',
    hours: [
      { day: 'Sun – Mon', hours: 'Closed' },
      { day: 'Tue – Thu', hours: '5:00 PM – 9:00 PM' },
      { day: 'Fri – Sat', hours: '4:30 PM – 9:30 PM' },
    ],
    phone: '(02) 4330 2198',
    address: '98 Pacific Hwy, Wyong',
    minutesFromHotel: 13,
    website: 'https://www.motelmezza.com.au/',
    email: 'enjoy@motelmezza.com.au',
    lat: -33.2846912,
    lng: 151.4246124,
  },
  {
    id: 'wyong-milk-factory',
    type: 'eat-drink',
    name: 'Wyong Milk Factory',
    category: 'Dining Precinct',
    location: 'Nearby',
    distanceKm: 8,
    tagline: 'A heritage dairy factory reborn as a dining precinct.',
    description:
      "A heritage precinct that was once a thriving dairy factory, beautifully restored into one of the Central Coast's most distinctive destinations. Home to a riverside tavern, local artisan producers, cafés, family-friendly spaces and events.",
    hours: [
      { day: 'Mon – Tue', hours: '10:00 AM – 3:00 PM' },
      { day: 'Wednesday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Thursday', hours: '10:00 AM – 9:30 PM' },
      { day: 'Friday', hours: '10:00 AM – 10:30 PM' },
      { day: 'Saturday', hours: '8:00 AM – 11:00 PM' },
      { day: 'Sunday', hours: '8:00 AM – 3:30 PM' },
    ],
    phone: '0478 475 669',
    address: '141 Alison Rd, Wyong',
    minutesFromHotel: 13,
    website: 'https://www.wyongmilkfactory.com.au/',
    email: 'info@wyongmilkfactory.com.au',
    lat: -33.279172,
    lng: 151.4174592,
  },
  {
    id: 'mexicoast-cantina',
    type: 'eat-drink',
    name: 'Mexicoast Cantina',
    category: 'Mexican',
    location: 'Nearby',
    distanceKm: 0.5,
    tagline: 'Bold Baja-inspired Mexican dining and margaritas.',
    description:
      'Drawing inspiration from the vibrant cantinas of the Mexican Baja Peninsula, this local favourite brings an authentic slice of traditional Mexican dining to the Central Coast, with a lively social atmosphere, bold flavours and margaritas.',
    hours: [
      { day: 'Monday', hours: 'Closed' },
      { day: 'Tuesday', hours: '5:00 PM – 8:00 PM' },
      { day: 'Wed – Thu', hours: '5:00 PM – 8:30 PM' },
      { day: 'Fri – Sat', hours: '12:00 PM – Late' },
      { day: 'Sunday', hours: '5:00 PM – 7:30 PM' },
    ],
    phone: '(02) 4396 6942',
    address: '9-10/243 Main Rd, Toukley',
    minutesFromHotel: 2,
    website: 'https://www.mexicoastcantina.com/',
    email: 'admin@mexicoastcantina.com',
    lat: -33.26415,
    lng: 151.5406,
  },
  {
    id: 'cue-and-crew',
    type: 'eat-drink',
    name: 'Cue & Crew',
    category: 'Smokehouse BBQ',
    location: 'Nearby',
    distanceKm: 9,
    tagline: 'Low-and-slow American-inspired barbecue.',
    description: 'An American-inspired smokehouse dedicated to the craft of low-and-slow barbecued meats.',
    hours: [
      { day: 'Sun – Mon', hours: 'Closed' },
      { day: 'Tue – Thu', hours: '5:30 PM – 8:00 PM' },
      { day: 'Fri – Sat', hours: '11:00 AM – 2:00 PM, 5:30 PM – 8:00 PM' },
    ],
    phone: '(02) 4072 1477',
    address: '2 Reliance Dr, Tuggerah',
    minutesFromHotel: 15,
    website: 'https://www.cueandcrew.com/',
    email: 'manager.cueandcrew@gmail.com',
    lat: -33.3134573,
    lng: 151.4216281,
  },
  {
    id: 'the-savoy-bar-and-music',
    type: 'eat-drink',
    name: 'The Savoy Bar & Music',
    category: 'Live Music Bar',
    location: 'Nearby',
    distanceKm: 15,
    tagline: 'A restored cinema with live music and great food.',
    description:
      'A restored cinema with great food, drinks and live musical performances by local and touring artists.',
    hours: [{ day: 'Every day', hours: '12:00 PM – Late' }],
    phone: '0406 461 122',
    address: '2/391 The Entrance Rd, Long Jetty',
    minutesFromHotel: 15,
    website: 'https://www.thesavoybarandmusic.com.au/',
    email: 'welcome@thesavoybarandmusic.com.au',
    lat: -33.3653702,
    lng: 151.4766742,
  },
];

const thingsToDoBase: Omit<Business, 'image' | 'gallery'>[] = [
  {
    id: 'live-entertainment',
    type: 'things-to-do',
    name: 'Live Entertainment',
    category: "What's On",
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Weekly live music and entertainment at the bar.',
    description:
      "Our bar hosts weekly events including soloists, bands, DJs and live sport feeds. Scan the in-venue QR code to see what's on.",
    hours: [{ day: 'Every day', hours: '11:00 AM – Late' }],
    schedule: [{ open: 11 * 60, close: 60 }],
    phone: '(02) 4317 2845',
    address: 'Level 3, The Beachcomber Hotel and Resort',
    website: hotelContactInfo.website,
    email: hotelContactInfo.email,
  },
  {
    id: 'saturday-yoga',
    type: 'things-to-do',
    name: 'Saturday Yoga',
    category: 'Yoga',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Complimentary lakeside yoga every Saturday morning.',
    description:
      'Join us at 8am on Saturday mornings for a complimentary yoga session by the lake. No experience or equipment is required.',
    hours: [{ day: 'Saturday', hours: '8:00 AM' }],
    schedule: [{ days: [6], open: 8 * 60, close: 9 * 60 }],
    phone: '(02) 4317 2845',
    address: 'Lakeside, The Beachcomber Hotel and Resort',
    website: hotelContactInfo.website,
    email: hotelContactInfo.email,
  },
  {
    id: 'heated-pool-and-spa',
    type: 'things-to-do',
    name: 'Heated Pool & Spa',
    category: 'Pool & Spa',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'A heated pool available to all guests, year-round.',
    description:
      'Our pool is heated and available for all guests. Access is via level 1 with your keycard, and the pool bar operates throughout summer.',
    hours: [{ day: 'Every day', hours: '8:00 AM – 8:00 PM' }],
    schedule: [{ open: 8 * 60, close: 20 * 60 }],
    address: 'Level 1, The Beachcomber Hotel and Resort',
  },
  {
    id: 'kids-playground',
    type: 'things-to-do',
    name: 'Kids Playground',
    category: 'Playground',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Lakeside play space for the kids to run free.',
    description:
      'Let the kids run free as you relax down by the lake. Order some lunch, grab a table and enjoy the sun. Access is via level 3, through the bistro.',
    hours: [{ day: 'Every day', hours: '8:00 AM – 8:00 PM' }],
    schedule: [{ open: 8 * 60, close: 20 * 60 }],
    address: 'Level 3, The Beachcomber Hotel and Resort',
  },
  {
    id: 'australian-reptile-park',
    type: 'things-to-do',
    name: 'Australian Reptile Park',
    category: 'Wildlife Park',
    location: 'Nearby',
    distanceKm: 35,
    tagline: "Australia's Best Major Tourist Attraction, 2023.",
    description:
      "The Australian Reptile Park offers an unforgettable experience for visitors of all ages, combining hands-on wildlife encounters with engaging and educational presentations. From kangaroos and koalas to alligators, giant tortoises and one of Australia's largest collections of reptiles, guests can hand-feed animals, enjoy interactive keeper talks and explore the park at their own pace.",
    hours: [{ day: 'Every day', hours: '9:00 AM – 5:00 PM' }],
    phone: '(02) 4340 1022',
    address: 'Pacific Hwy, Somersby',
    minutesFromHotel: 30,
    website: 'https://www.reptilepark.com.au',
    email: 'admin@reptilepark.com.au',
    lat: -33.4193524,
    lng: 151.2860216,
  },
  {
    id: 'broken-bay-pearl-farm',
    type: 'things-to-do',
    name: 'Broken Bay Pearl Farm',
    category: 'Pearl Farm Tours',
    location: 'Nearby',
    distanceKm: 40,
    tagline: 'Discover the secrets of pearl farming on the Hawkesbury River.',
    description:
      'Take to the water and discover the secrets of pearl farming along the stunning Hawkesbury River. Offers guided tours, scenic boat cruises, handcrafted jewellery and hands-on oyster farming experiences.',
    hours: [
      { day: 'Monday', hours: 'Closed' },
      { day: 'Tue – Sun', hours: '10:00 AM – 4:00 PM (tours by booking)' },
    ],
    phone: '0488 361 042',
    address: '12 Kowan Rd, Mooney Mooney',
    minutesFromHotel: 38,
    website: 'https://brokenbaypearlfarm.com.au',
    email: 'hello@brokenbaypearlfarm.com.au',
    lat: -33.5267055,
    lng: 151.2011883,
  },
  {
    id: 'chocolate-factory',
    type: 'things-to-do',
    name: 'Chocolate Factory',
    category: 'Chocolate & Tours',
    location: 'Nearby',
    distanceKm: 25,
    tagline: 'The sweetest place on the Central Coast.',
    description: 'Shop handcrafted chocolates or book in for an immersive factory tour.',
    hours: [{ day: 'Every day', hours: '9:00 AM – 4:00 PM' }],
    phone: '(02) 4322 3222',
    address: '6 Jusfrute Dr, West Gosford',
    minutesFromHotel: 20,
    website: 'https://chocolatefactorygosford.com.au',
    email: 'info@chocolatefactorygosford.com.au',
    lat: -33.4297807,
    lng: 151.3132326,
  },
  {
    id: 'iris-lodge-alpacas',
    type: 'things-to-do',
    name: 'Iris Lodge Alpacas',
    category: 'Alpaca Farm',
    location: 'Nearby',
    distanceKm: 12,
    tagline: 'Ethical alpaca meet-and-greets and a premium brunch.',
    description:
      'A unique opportunity for ethical meet-and-greets or a premium brunch experience surrounded by alpacas.',
    hours: [
      { day: 'Sat – Sun', hours: 'Breakfast 8:30 AM (booking required)' },
      { day: 'Every day', hours: 'Farm Visit 3:00 PM (booking required)' },
    ],
    phone: '0467 950 470',
    address: '33 Dunks Ln, Jilliby',
    minutesFromHotel: 17,
    website: 'https://www.irislodgealpacas.com',
    email: 'irislodgealpacas@gmail.com',
    lat: -33.2615283,
    lng: 151.3771377,
  },
  {
    id: 'treetops-adventure',
    type: 'things-to-do',
    name: 'TreeTops Adventure Central Coast',
    category: 'Adventure Park',
    location: 'Nearby',
    distanceKm: 10,
    tagline: 'Adrenaline-fuelled fun for all ages.',
    description:
      "One of the region's standout attractions, nestled within the Ourimbah State Forest. The park offers a range of aerial rope courses, suspended bridges, monkey bars and ziplines, including New South Wales' longest zipcoaster at 500 metres. Visitors can also bounce through NetWorld, an elevated trampoline playground with large inflatables.",
    hours: [
      { day: 'Mon – Fri', hours: '10:00 AM – 5:00 PM' },
      { day: 'Sat – Sun', hours: '9:00 AM – 5:00 PM' },
    ],
    phone: '(02) 4307 4905',
    address: '1 Red Hill Rd, Wyong Creek',
    minutesFromHotel: 20,
    website: 'https://treetopsadventure.com.au/location/nsw-central-coast/',
    email: 'centralcoast@treetopsadventure.com.au',
    lat: -33.2899374,
    lng: 151.3291669,
  },
  {
    id: 'battlekart-tuggerah',
    type: 'things-to-do',
    name: 'BattleKart Tuggerah',
    category: 'Go-Karting',
    location: 'Nearby',
    distanceKm: 9,
    tagline: 'Go-karting with augmented reality challenges.',
    description:
      'Experience go-karting like never before, with augmented reality and interactive video game challenges.',
    hours: [
      { day: 'Mon – Fri', hours: '12:00 PM – 8:00 PM' },
      { day: 'Sat – Sun', hours: '10:00 AM – 8:00 PM' },
    ],
    phone: '0428 201 565',
    address: '184-186 Pacific Hwy, Tuggerah',
    minutesFromHotel: 11,
    website: 'https://www.battlekart.com/en/tuggerah',
    email: 'info@tuggerah.battlekart.com',
    lat: -33.3052094,
    lng: 151.4202704,
  },
  {
    id: 'ken-duncan-gallery',
    type: 'things-to-do',
    name: 'Ken Duncan Gallery',
    category: 'Photography Gallery',
    location: 'Nearby',
    distanceKm: 20,
    tagline: 'Breathtaking landscape photography by Ken Duncan.',
    description: 'Discover the breathtaking work of renowned Australian landscape photographer Ken Duncan.',
    hours: [{ day: 'Every day', hours: '9:00 AM – 4:00 PM' }],
    phone: '(02) 4367 6701',
    address: '414 The Entrance Rd, Erina Heights',
    minutesFromHotel: 31,
    website: 'https://kenduncan.com',
    email: 'erina@kenduncan.com',
    lat: -33.4257228,
    lng: 151.4069208,
  },
  {
    id: 'central-coast-aero-club',
    type: 'things-to-do',
    name: 'Central Coast Aero Club',
    category: 'Scenic Flights',
    location: 'Nearby',
    distanceKm: 10,
    tagline: 'See the hotel from above on a scenic flight.',
    description:
      'See the hotel from above and take in the beauty of the coast with a scenic flight from the Central Coast Aero Club. Departing from Warnervale Airport, with sunrise joyflights and guided lessons.',
    hours: [{ day: 'Every day', hours: '7:30 AM – 4:30 PM' }],
    phone: '(02) 4392 5174',
    address: '25 Jack Grant Ave, Warnervale',
    minutesFromHotel: 10,
    website: 'https://ccac.com.au',
    email: 'contact@ccac.com.au',
    lat: -33.2390652,
    lng: 151.4334583,
  },
];

export const eatAndDrink: Business[] = eatAndDrinkBase.map((b) => withImages(b, eatAndDrinkImages));
export const thingsToDo: Business[] = thingsToDoBase.map((b) => withImages(b, thingsToDoImages));

export const allBusinesses: Business[] = [...eatAndDrink, ...thingsToDo];

export const getBusinessById = (id: string) => allBusinesses.find((b) => b.id === id);

export { responsiveSrcSet } from './media';

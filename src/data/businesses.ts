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
  image: string;
  gallery: string[];
  hours: { day: string; hours: string }[];
  /** Structured hours for computing open/closed status. Undefined = hours unknown. */
  schedule?: Schedule[];
  phone: string;
  address: string;
}

const img = (seed: string, w = 1200, h = 900) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PICSUM_URL = /^(.*\/seed\/[^/]+\/)(\d+)\/(\d+)$/;

// Matches any Cloudinary delivery URL, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/<optional transforms>/<public_id>
const CLOUDINARY_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/**
 * Builds a srcSet requesting the same image at several widths, so the browser
 * can fetch one sized to how large it's actually rendered instead of always
 * the full source dimensions. Understands both picsum.photos URLs (current
 * placeholder images) and Cloudinary delivery URLs, so swapping the `image`/
 * `gallery` URLs in this file over to Cloudinary is a drop-in replacement —
 * no other code needs to change.
 */
export function responsiveSrcSet(url: string, widths: number[]): string | undefined {
  const picsumMatch = url.match(PICSUM_URL);
  if (picsumMatch) {
    const [, base, sourceW, sourceH] = picsumMatch;
    const aspect = Number(sourceH) / Number(sourceW);
    return widths.map((w) => `${base}${w}/${Math.round(w * aspect)} ${w}w`).join(', ');
  }

  const cloudinaryMatch = url.match(CLOUDINARY_URL);
  if (cloudinaryMatch) {
    const [, base, publicId] = cloudinaryMatch;
    return widths.map((w) => `${base}w_${w},c_limit,f_auto,q_auto/${publicId} ${w}w`).join(', ');
  }

  return undefined;
}

const callAhead = [{ day: 'Hours', hours: 'Please call ahead' }];

export const eatAndDrink: Business[] = [
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
    image: img('beachie-bar-hero'),
    gallery: [img('beachie-bar-1'), img('beachie-bar-2'), img('beachie-bar-3'), img('beachie-bar-4')],
    hours: [
      { day: 'Every day', hours: '11:00 AM – Late' },
      { day: 'Room Service', hours: 'Until 9:00 PM' },
    ],
    schedule: [{ open: 11 * 60, close: 60 }],
    phone: '(02) 4317 2845',
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
    image: img('pelicans-hero'),
    gallery: [img('pelicans-1'), img('pelicans-2'), img('pelicans-3'), img('pelicans-4')],
    hours: [{ day: 'Breakfast, every day', hours: '7:00 AM – 10:00 AM' }],
    schedule: [{ open: 7 * 60, close: 10 * 60 }],
    phone: '(02) 4317 2845',
    address: 'Level 3, The Beachcomber Hotel and Resort',
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
    image: img('bbs-soul-kitchen-hero'),
    gallery: [img('bbs-1'), img('bbs-2'), img('bbs-3'), img('bbs-4')],
    hours: callAhead,
    phone: '0412 190 124',
    address: '5/243-245 Main Rd, Toukley',
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
    image: img('johnny-tapas-hero'),
    gallery: [img('johnny-tapas-1'), img('johnny-tapas-2'), img('johnny-tapas-3'), img('johnny-tapas-4')],
    hours: callAhead,
    phone: '(02) 4396 4656',
    address: '7 Mitchell St, Norah Head',
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
    image: img('motel-mezza-hero'),
    gallery: [img('motel-mezza-1'), img('motel-mezza-2'), img('motel-mezza-3'), img('motel-mezza-4')],
    hours: callAhead,
    phone: '(02) 4330 2198',
    address: '98 Pacific Hwy, Wyong',
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
    image: img('wyong-milk-factory-hero'),
    gallery: [img('wmf-1'), img('wmf-2'), img('wmf-3'), img('wmf-4')],
    hours: callAhead,
    phone: '0478 475 669',
    address: '141 Alison Rd, Wyong',
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
    image: img('mexicoast-cantina-hero'),
    gallery: [img('mexicoast-1'), img('mexicoast-2'), img('mexicoast-3'), img('mexicoast-4')],
    hours: callAhead,
    phone: '(02) 4396 6942',
    address: '9-10/243 Main Rd, Toukley',
  },
  {
    id: 'cue-and-crew',
    type: 'eat-drink',
    name: 'Cue & Crew',
    category: 'Smokehouse BBQ',
    location: 'Nearby',
    distanceKm: 9,
    tagline: 'Low-and-slow American-inspired barbecue.',
    description:
      'An American-inspired smokehouse dedicated to the craft of low-and-slow barbecued meats.',
    image: img('cue-and-crew-hero'),
    gallery: [img('cue-crew-1'), img('cue-crew-2'), img('cue-crew-3'), img('cue-crew-4')],
    hours: callAhead,
    phone: '(02) 4072 1477',
    address: '2 Reliance Dr, Tuggerah',
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
    image: img('savoy-bar-hero'),
    gallery: [img('savoy-1'), img('savoy-2'), img('savoy-3'), img('savoy-4')],
    hours: callAhead,
    phone: '0406 461 122',
    address: '2/391 The Entrance Rd, Long Jetty',
  },
];

export const thingsToDo: Business[] = [
  {
    id: 'live-entertainment',
    type: 'things-to-do',
    name: 'Live Entertainment',
    category: 'Live Music',
    location: 'In-Hotel',
    distanceKm: 0,
    tagline: 'Weekly live music and entertainment at the bar.',
    description:
      "Our bar hosts weekly events including soloists, bands, DJs and live sport feeds. Scan the in-venue QR code to see what's on.",
    image: img('live-entertainment-hero'),
    gallery: [img('live-ent-1'), img('live-ent-2'), img('live-ent-3'), img('live-ent-4')],
    hours: [{ day: 'Every day', hours: '11:00 AM – Late' }],
    schedule: [{ open: 11 * 60, close: 60 }],
    phone: '(02) 4317 2845',
    address: 'Level 3, The Beachcomber Hotel and Resort',
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
    image: img('heated-pool-hero'),
    gallery: [img('pool-spa-1'), img('pool-spa-2'), img('pool-spa-3'), img('pool-spa-4')],
    hours: [{ day: 'Every day', hours: '8:00 AM – 8:00 PM' }],
    schedule: [{ open: 8 * 60, close: 20 * 60 }],
    phone: '(02) 4317 2845',
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
      'Let the kids run free as you relax down by the lake. Order some lunch, grab a table and enjoy the sun.',
    image: img('kids-playground-hero'),
    gallery: [img('kids-play-1'), img('kids-play-2'), img('kids-play-3'), img('kids-play-4')],
    hours: [{ day: 'Every day', hours: '8:00 AM – 8:00 PM' }],
    schedule: [{ open: 8 * 60, close: 20 * 60 }],
    phone: '(02) 4317 2845',
    address: 'Lakeside, The Beachcomber Hotel and Resort',
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
    image: img('saturday-yoga-hero'),
    gallery: [img('yoga-1'), img('yoga-2'), img('yoga-3'), img('yoga-4')],
    hours: [{ day: 'Saturday', hours: '8:00 AM' }],
    schedule: [{ days: [6], open: 8 * 60, close: 9 * 60 }],
    phone: '(02) 4317 2845',
    address: 'Lakeside, The Beachcomber Hotel and Resort',
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
    image: img('reptile-park-hero'),
    gallery: [img('reptile-1'), img('reptile-2'), img('reptile-3'), img('reptile-4')],
    hours: callAhead,
    phone: '(02) 4340 1022',
    address: 'Pacific Hwy, Somersby',
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
    image: img('pearl-farm-hero'),
    gallery: [img('pearl-1'), img('pearl-2'), img('pearl-3'), img('pearl-4')],
    hours: callAhead,
    phone: '0488 361 042',
    address: '12 Kowan Rd, Mooney Mooney',
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
    image: img('chocolate-factory-hero'),
    gallery: [img('choc-1'), img('choc-2'), img('choc-3'), img('choc-4')],
    hours: callAhead,
    phone: '(02) 4322 3222',
    address: '6 Jusfrute Dr, West Gosford',
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
    image: img('iris-lodge-hero'),
    gallery: [img('alpaca-1'), img('alpaca-2'), img('alpaca-3'), img('alpaca-4')],
    hours: callAhead,
    phone: '0467 950 470',
    address: '33 Dunks Ln, Jilliby',
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
    image: img('treetops-hero'),
    gallery: [img('treetops-1'), img('treetops-2'), img('treetops-3'), img('treetops-4')],
    hours: callAhead,
    phone: '(02) 4307 4905',
    address: '1 Red Hill Rd, Wyong Creek',
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
    image: img('battlekart-hero'),
    gallery: [img('battlekart-1'), img('battlekart-2'), img('battlekart-3'), img('battlekart-4')],
    hours: callAhead,
    phone: '0428 201 565',
    address: '8/186 Pacific Hwy, Tuggerah',
  },
  {
    id: 'ken-duncan-gallery',
    type: 'things-to-do',
    name: 'Ken Duncan Gallery',
    category: 'Photography Gallery',
    location: 'Nearby',
    distanceKm: 20,
    tagline: 'Breathtaking landscape photography by Ken Duncan.',
    description:
      'Discover the breathtaking work of renowned Australian landscape photographer Ken Duncan.',
    image: img('ken-duncan-hero'),
    gallery: [img('ken-duncan-1'), img('ken-duncan-2'), img('ken-duncan-3'), img('ken-duncan-4')],
    hours: callAhead,
    phone: '(02) 4367 6701',
    address: '414 The Entrance Rd, Erina Heights',
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
    image: img('aero-club-hero'),
    gallery: [img('aero-1'), img('aero-2'), img('aero-3'), img('aero-4')],
    hours: callAhead,
    phone: '(02) 4392 5174',
    address: '25 Jack Grant Ave, Warnervale',
  },
];

export const allBusinesses: Business[] = [...eatAndDrink, ...thingsToDo];

export const getBusinessById = (id: string) =>
  allBusinesses.find((b) => b.id === id);

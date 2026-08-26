import { HOTEL_INFO_HERO_IMAGE_URL, resolveImage } from './media';

export interface InfoItem {
  label: string;
  value: string;
  detail?: string;
}

export const infoItems: InfoItem[] = [
  { label: 'Check-Out', value: '10:00 AM' },
  { label: 'Wi-Fi', value: 'BCH-Resort WiFi', detail: 'No password required' },
  { label: 'Parking', value: 'Complimentary' },
  { label: 'Front Desk', value: '24 Hours', detail: 'Dial 9 from any room phone' },
  { label: 'Breakfast', value: '7:00 AM – 10:00 AM', detail: 'Pelicans, Level 3' },
  { label: 'Pool Hours', value: '8:00 AM – 8:00 PM' },
  { label: 'Room Service', value: '11:00 AM – 9:00 PM' },
];

export const heroImage = resolveImage(HOTEL_INFO_HERO_IMAGE_URL);

export const contactInfo = {
  phone: '(02) 4317 2845',
  address: '200 Main Rd, Toukley NSW 2263',
  email: 'reservations@beachcomberhotelandresort.com.au',
  website: 'https://beachcomberhotelandresort.com.au',
  websiteLabel: 'beachcomberhotelandresort.com.au',
  instagram: 'https://instagram.com/thebeachie',
  facebook: 'https://facebook.com/thebeachie',
  lat: -33.2631224,
  lng: 151.535408,
};

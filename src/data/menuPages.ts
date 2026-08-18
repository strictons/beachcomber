export interface MenuPage {
  path: string;
  label: string;
  index: string;
}

export const menuPages: MenuPage[] = [
  { path: '/hotel-information', label: 'Hotel Information', index: '01' },
  { path: '/eat-drink', label: 'Eat & Drink', index: '02' },
  { path: '/things-to-do', label: 'Things To Do', index: '03' },
  { path: '/map', label: 'Neighbourhood Map', index: '04' },
];

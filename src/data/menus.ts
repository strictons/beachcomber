import beachieFoodMenu from '../assets/beachie-food-menu.pdf';
import beachieDrinksMenu from '../assets/beachie-drinks-menu.pdf';

export type MenuType = 'food' | 'drinks';

export interface BusinessMenus {
  food?: string;
  drinks?: string;
}

/** PDF menus available per business, keyed by Business.id. */
export const businessMenus: Record<string, BusinessMenus> = {
  'the-beachie-bar-and-bistro': {
    food: beachieFoodMenu,
    drinks: beachieDrinksMenu,
  },
};

import BusinessList from './BusinessList';
import { eatAndDrink } from '../data/businesses';

export default function EatAndDrink() {
  return (
    <BusinessList
      title="Eat & Drink"
      businesses={eatAndDrink}
      basePath="/eat-drink"
    />
  );
}

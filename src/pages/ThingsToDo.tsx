import BusinessList from './BusinessList';
import { thingsToDo } from '../data/businesses';

export default function ThingsToDo() {
  return (
    <BusinessList
      title="Things To Do"
      businesses={thingsToDo}
      basePath="/things-to-do"
    />
  );
}

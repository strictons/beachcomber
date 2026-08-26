import { categoryIcons } from '../data/categoryIcons';
import type { BusinessType } from '../data/businesses';

export default function CategoryIcon({ type, className }: { type: BusinessType; className?: string }) {
  const icon = categoryIcons[type];
  return (
    <svg
      viewBox={icon.viewBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.inner }}
    />
  );
}

import { Link } from 'react-router-dom';
import { LOGO_URL } from '../data/media';

const COVER_BLUE = '#567791';

export default function Logo({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const sizeClass = 'h-5 min-[400px]:h-6 sm:h-7';

  return (
    <Link to="/" className="flex items-center select-none" aria-label="The Beachcomber Hotel and Resort — home">
      {theme === 'dark' ? (
        <span
          role="img"
          aria-label="The Beachcomber Hotel and Resort"
          className={`inline-block w-auto ${sizeClass}`}
          style={{
            aspectRatio: '807 / 100',
            backgroundColor: COVER_BLUE,
            WebkitMaskImage: `url(${LOGO_URL})`,
            maskImage: `url(${LOGO_URL})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'left center',
            maskPosition: 'left center',
          }}
        />
      ) : (
        <img
          src={LOGO_URL}
          alt="The Beachcomber Hotel and Resort"
          className={`w-auto ${sizeClass}`}
          fetchPriority="high"
          decoding="sync"
        />
      )}
    </Link>
  );
}

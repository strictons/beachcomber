import { useEffect, useState } from 'react';

type VideoBackgroundProps = {
  src: string;
  poster?: string;
  mobileSrc?: string;
  mobilePoster?: string;
};

const MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

export default function VideoBackground({ src, poster, mobileSrc, mobilePoster }: VideoBackgroundProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateSource = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateSource);
    return () => mediaQuery.removeEventListener('change', updateSource);
  }, []);

  const selectedSrc = isMobile && mobileSrc ? mobileSrc : src;
  const selectedPoster = isMobile && mobilePoster ? mobilePoster : poster;

  return (
    <video
      key={selectedSrc}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={selectedSrc}
      poster={selectedPoster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      // @ts-expect-error -- fetchPriority isn't in React's video element types yet
      fetchPriority="high"
    />
  );
}

type VideoBackgroundProps = {
  src: string;
  poster?: string;
  mobileSrc?: string;
  mobilePoster?: string;
};

const MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

export default function VideoBackground({ src, poster, mobileSrc, mobilePoster }: VideoBackgroundProps) {
  return (
    <>
      {poster && (
        <picture aria-hidden="true" className="absolute inset-0">
          {mobilePoster && <source media={MOBILE_MEDIA_QUERY} srcSet={mobilePoster} />}
          <img className="h-full w-full object-cover" src={poster} alt="" />
        </picture>
      )}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        // @ts-expect-error -- fetchPriority isn't in React's video element types yet
        fetchPriority="high"
      >
        {mobileSrc && <source media={MOBILE_MEDIA_QUERY} src={mobileSrc} />}
        <source src={src} />
      </video>
    </>
  );
}

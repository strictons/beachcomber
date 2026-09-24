type VideoBackgroundProps = {
  src: string;
  poster?: string;
  mobileSrc?: string;
  mobilePoster?: string;
};

export default function VideoBackground({ src, poster, mobileSrc, mobilePoster }: VideoBackgroundProps) {
  return (
    <>
      {poster && (
        <picture aria-hidden="true" className="absolute inset-0">
          {mobilePoster && <source media="(max-width: 767px)" srcSet={mobilePoster} />}
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
        {mobileSrc && <source media="(max-width: 767px)" src={mobileSrc} />}
        <source src={src} />
      </video>
    </>
  );
}

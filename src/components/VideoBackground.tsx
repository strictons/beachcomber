export default function VideoBackground({ src, poster }: { src: string; poster?: string }) {
  return (
    <video
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={poster || undefined}
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

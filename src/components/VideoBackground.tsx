export default function VideoBackground({ src }: { src: string }) {
  return (
    <video
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={src}
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

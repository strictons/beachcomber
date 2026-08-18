import type { ReactNode } from 'react';

export default function Hero({
  image,
  srcSet,
  sizes = '100vw',
  heightClass = 'h-[46vh] min-h-[320px]',
  children,
  overlay = 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.55) 100%)',
}: {
  image: string;
  srcSet?: string;
  sizes?: string;
  heightClass?: string;
  children?: ReactNode;
  overlay?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${heightClass}`}>
      <img
        src={image}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: overlay }} />
      {children}
    </div>
  );
}

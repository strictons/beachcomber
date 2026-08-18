import NavBar from '../components/NavBar';

export default function NeighbourhoodMap() {
  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <NavBar theme="dark" sticky title="Neighbourhood Map" />

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
              stroke="#a3a3a3"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-2 max-w-xs text-[14px] text-neutral-400">
          Coming soon. We're putting together a curated map of the neighbourhood.
        </p>
      </div>
    </div>
  );
}

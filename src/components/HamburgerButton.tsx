export default function HamburgerButton({
  onClick,
  theme = 'dark',
}: {
  onClick: () => void;
  theme?: 'light' | 'dark';
}) {
  const color = theme === 'light' ? 'bg-white' : 'bg-[#1d1d1f]';
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      className="group flex h-11 w-11 flex-col items-center justify-center gap-[6px] cursor-pointer"
    >
      <span
        className={`h-[1.5px] w-6 origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-4 ${color}`}
      />
      <span
        className={`h-[1.5px] w-4 origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-6 ${color}`}
      />
    </button>
  );
}

import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import HamburgerButton from './HamburgerButton';
import { useMenu } from './MenuContext';

export default function NavBar({
  theme = 'light',
  variant = 'logo',
  backTo,
  sticky = false,
  title,
  scrolled = false,
}: {
  theme?: 'light' | 'dark';
  variant?: 'logo' | 'back';
  backTo?: string;
  sticky?: boolean;
  title?: string;
  /**
   * For a `variant="back"`, non-sticky bar (the transparent one floating over
   * a Hero image): switches it to fixed positioning with a blurred
   * background and reveals `title`, for a page that should look untouched at
   * the top but pick up a compact "back to X" bar once scrolled.
   */
  scrolled?: boolean;
}) {
  const { toggle } = useMenu();
  const navigate = useNavigate();
  const floatingBack = variant === 'back' && !sticky;
  const effectiveTheme = floatingBack && scrolled ? 'dark' : theme;
  const iconColor = effectiveTheme === 'light' ? 'text-white' : 'text-[#1d1d1f]';

  const containerClass = sticky
    ? 'sticky top-0 z-30 flex items-center justify-between border-b border-white/70 bg-[#edd9ca] px-4 pt-6 pb-4 sm:px-10 sm:pt-8 sm:pb-5'
    : floatingBack
      ? `fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-6 sm:px-10 sm:pt-8 transition-all duration-300 ease-out ${
          scrolled
            ? 'border-b border-black/5 bg-[#edd9ca]/85 pb-4 backdrop-blur-md sm:pb-5'
            : 'border-b border-transparent bg-transparent pb-0'
        }`
      : 'absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-6 sm:px-10 sm:pt-8';

  return (
    <div className={containerClass}>
      {variant === 'logo' ? (
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          <div className="shrink-0">
            <Logo theme={theme} />
          </div>
          {title && (
            <>
              <span
                aria-hidden="true"
                className={`h-5 shrink-0 w-px sm:h-6 ${theme === 'light' ? 'bg-white/30' : 'bg-[#1d1d1f]/15'}`}
              />
              <span
                className={`min-w-0 flex-1 truncate whitespace-nowrap font-heading text-[11px] font-normal uppercase tracking-[0.03em] min-[400px]:text-[15px] min-[400px]:tracking-[0.06em] sm:text-[19px] sm:tracking-[0.08em] ${
                  theme === 'light' ? 'text-white/75' : 'text-[#1d1d1f]/45'
                }`}
              >
                {title}
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            aria-label="Go back"
            className={`flex h-11 w-11 -translate-x-2 shrink-0 items-center justify-center cursor-pointer ${iconColor}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {title && (
            <span
              className={`min-w-0 flex-1 truncate whitespace-nowrap font-heading text-[13px] font-medium uppercase tracking-[0.06em] transition-opacity duration-300 sm:text-[15px] sm:tracking-[0.08em] ${iconColor} ${
                floatingBack ? (scrolled ? 'opacity-90' : 'opacity-0') : 'opacity-90'
              }`}
            >
              {title}
            </span>
          )}
        </div>
      )}

      <HamburgerButton onClick={toggle} theme={effectiveTheme} />
    </div>
  );
}

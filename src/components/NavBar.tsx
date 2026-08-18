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
}: {
  theme?: 'light' | 'dark';
  variant?: 'logo' | 'back';
  backTo?: string;
  sticky?: boolean;
  title?: string;
}) {
  const { toggle } = useMenu();
  const navigate = useNavigate();
  const iconColor = theme === 'light' ? 'text-white' : 'text-[#1d1d1f]';

  return (
    <div
      className={
        sticky
          ? 'sticky top-0 z-30 flex items-center justify-between bg-[#edd9ca] px-6 pt-6 pb-4 sm:px-10 sm:pt-8 sm:pb-5'
          : 'absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8'
      }
    >
      {variant === 'logo' ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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
                className={`min-w-0 flex-1 truncate whitespace-nowrap font-heading text-[15px] font-normal uppercase tracking-[0.06em] sm:text-[19px] sm:tracking-[0.08em] ${
                  theme === 'light' ? 'text-white/75' : 'text-[#1d1d1f]/45'
                }`}
              >
                {title}
              </span>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Go back"
          className={`flex h-11 w-11 -translate-x-2 items-center justify-center cursor-pointer ${iconColor}`}
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
      )}

      <HamburgerButton onClick={toggle} theme={theme} />
    </div>
  );
}

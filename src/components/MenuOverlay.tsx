import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMenu } from './MenuContext';
import Logo from './Logo';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { menuPages } from '../data/menuPages';

export default function MenuOverlay() {
  const { isOpen, close } = useMenu();
  const location = useLocation();

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return unlockScroll;
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#567791] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          <Logo theme="light" />
          <button
            onClick={close}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center cursor-pointer"
          >
            <span className="relative block h-5 w-5">
              <span className="absolute top-1/2 left-0 h-[1.5px] w-5 -translate-y-1/2 rotate-45 bg-white" />
              <span className="absolute top-1/2 left-0 h-[1.5px] w-5 -translate-y-1/2 -rotate-45 bg-white" />
            </span>
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-6 sm:px-10">
          <ul className="flex flex-col">
            {menuPages.map((link, i) => (
              <li
                key={link.path}
                className="border-b border-white/10 first:border-t"
                style={{
                  transitionDelay: isOpen ? `${100 + i * 60}ms` : '0ms',
                }}
              >
                <Link
                  to={link.path}
                  className={`group flex items-baseline justify-between py-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:py-7 ${
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span className="font-display text-[28px] tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-[44px]">
                    {link.label}
                  </span>
                  <span className="text-[9px] font-light tracking-[0.2em] text-white/40 sm:text-xs">
                    {link.index}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4 px-6 pb-8 sm:px-10 sm:pb-10">
          <div className="flex flex-col gap-1 text-[11px] font-light tracking-wide text-white/40">
            <span>200 Main Rd, Toukley NSW 2263</span>
            <span>
              (02) 4317 2845 ·{' '}
              <a
                href="https://beachcomberhotelandresort.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70"
              >
                beachcomberhotelandresort.com.au
              </a>
            </span>
          </div>
          <div className="flex gap-5 text-[11px] font-light tracking-wide text-white/40">
            <a
              href="https://instagram.com/thebeachie"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/thebeachie"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

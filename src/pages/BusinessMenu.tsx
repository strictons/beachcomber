import { useParams, Navigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import PdfViewer from '../components/PdfViewer';
import RoomServiceNote from '../components/RoomServiceNote';
import { getBusinessById } from '../data/businesses';
import { businessMenus, type MenuType } from '../data/menus';

const MENU_LABELS: Record<MenuType, string> = {
  food: 'Food Menu',
  drinks: 'Drinks Menu',
};

export default function BusinessMenu() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const business = id ? getBusinessById(id) : undefined;
  const menus = id ? businessMenus[id] : undefined;

  if (!business || !menus) return <Navigate to="/" replace />;
  if (type !== 'food' && type !== 'drinks') return <Navigate to={`/eat-drink/${business.id}`} replace />;

  const pdfUrl = menus[type];
  if (!pdfUrl) {
    const fallback: MenuType = type === 'food' ? 'drinks' : 'food';
    return menus[fallback] ? (
      <Navigate to={`/eat-drink/${business.id}/menu/${fallback}`} replace />
    ) : (
      <Navigate to={`/eat-drink/${business.id}`} replace />
    );
  }

  const basePath = `/eat-drink/${business.id}/menu`;

  return (
    <div className="min-h-screen bg-[#edd9ca]">
      <NavBar theme="dark" sticky variant="back" backTo={`/eat-drink/${business.id}`} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-[#edd9ca] px-6 py-3 sm:px-10">
        <div className="min-w-0">
          <p className="truncate font-heading text-[10px] font-medium uppercase tracking-[0.12em] text-[#1d1d1f]/45">
            {business.name}
          </p>
          <h1 className="font-display text-[20px] text-[#1d1d1f]">{MENU_LABELS[type]}</h1>
        </div>

        <div className="flex items-center gap-2">
          {(['food', 'drinks'] as const).map((t) => {
            const available = Boolean(menus[t]);
            const active = t === type;
            if (!available) return null;
            return (
              <Link
                key={t}
                to={`${basePath}/${t}`}
                className={`rounded-full px-3.5 py-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] transition-colors sm:text-[12px] ${
                  active
                    ? `text-[#1d1d1f] ${t === 'food' ? 'bg-[#A7E5FF]' : 'bg-[#FFCA54]'}`
                    : 'bg-white/70 text-[#1d1d1f]/60 hover:bg-white'
                }`}
              >
                {MENU_LABELS[t]}
              </Link>
            );
          })}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 font-heading text-[11px] font-medium uppercase tracking-[0.08em] text-[#1d1d1f]/60 transition-colors hover:bg-white sm:text-[12px]"
          >
            Open
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-10 sm:py-10">
        <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-4">
          <PdfViewer key={pdfUrl} src={pdfUrl} />
        </div>

        {business.id === 'the-beachie-bar-and-bistro' && (
          <div className="mt-6">
            <RoomServiceNote />
          </div>
        )}
      </div>
    </div>
  );
}

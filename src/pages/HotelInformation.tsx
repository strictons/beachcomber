import { preload } from 'react-dom';
import NavBar from '../components/NavBar';
import { infoItems, heroImage, contactInfo } from '../data/hotelInfo';
import { responsiveSrcSet, cldImageUrl } from '../data/businesses';

const HERO_SIZES = '(min-width: 700px) 640px, 100vw';
const heroSrc = cldImageUrl(heroImage.url, 960);
const heroSrcSet = responsiveSrcSet(heroImage.url, [480, 672, 960, 1344]);

export default function HotelInformation() {
  preload(heroSrc, { as: 'image', fetchPriority: 'high', imageSrcSet: heroSrcSet, imageSizes: HERO_SIZES });

  return (
    <div className="min-h-screen bg-[#edd9ca]">
      <NavBar theme="dark" sticky title="Hotel Information" mobileTitle="Hotel Info" />

      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="mb-10 aspect-[3/2] overflow-hidden rounded-xl bg-neutral-100">
          <img
            src={heroSrc}
            srcSet={heroSrcSet}
            sizes={HERO_SIZES}
            alt="The Beachcomber Hotel and Resort"
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: heroImage.position }}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        <div className="divide-y divide-neutral-100 border-t border-neutral-100">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="text-[14px] text-neutral-500">{item.label}</span>
              <span className="text-[14px] font-medium text-[#1d1d1f] sm:truncate sm:text-right">
                {item.value}
                {item.detail && (
                  <span className="block font-normal italic text-neutral-400 sm:ml-1.5 sm:inline">
                    {item.detail}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <section className="mt-14 border-t border-neutral-100 pt-8 text-center">
          <p className="text-[13px] text-neutral-500">Need anything else?</p>
          <p className="mt-1 text-[14px] font-medium text-[#1d1d1f]">
            <a href={`tel:${contactInfo.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
              {contactInfo.phone}
            </a>
          </p>
          <p className="mt-1 text-[13px] text-neutral-400">{contactInfo.address}</p>

          <div className="mt-6 flex flex-col items-center gap-2 text-[13px] text-neutral-400 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2">
            <a
              href={contactInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all hover:text-[#1d1d1f] hover:underline"
            >
              {contactInfo.websiteLabel}
            </a>
            <a href={`mailto:${contactInfo.email}`} className="break-all hover:text-[#1d1d1f] hover:underline">
              {contactInfo.email}
            </a>
            <a
              href={contactInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1d1d1f] hover:underline"
            >
              Instagram
            </a>
            <a
              href={contactInfo.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1d1d1f] hover:underline"
            >
              Facebook
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

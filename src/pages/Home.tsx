import NavBar from '../components/NavBar';
import VideoBackground from '../components/VideoBackground';

const HOME_VIDEO_SRC =
  'https://beachcomberhotelandresort.com.au/wp-content/uploads/2022/10/bchrbg3.webm';

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <VideoBackground src={HOME_VIDEO_SRC} />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <NavBar theme="light" />

      <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center sm:top-[32%]">
        <h1 className="font-display text-[28px] leading-[1.25] text-white sm:text-[42px]">
          Your Guide to Our Hotel
          <br />
          &amp; the Neighbourhood
        </h1>
        <p className="mt-5 max-w-xs text-[15px] font-light leading-relaxed text-white/80 sm:mt-6 sm:max-w-sm">
          Every business featured is one that we would personally recommend to a friend.
        </p>
        <p className="mt-5 max-w-xs text-[15px] font-light leading-relaxed text-white/80 sm:mt-6 sm:max-w-sm">
          We hope you enjoy your stay.
        </p>
      </div>
    </div>
  );
}

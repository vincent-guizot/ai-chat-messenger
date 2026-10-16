import { useId } from 'react';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  sm: 'h-9 w-12',
  md: 'h-10 w-14',
  lg: 'h-[72px] w-24',
};

const FRONT_BUBBLE_PATH =
  'M165 120H395A70 70 0 0 1 465 190V310A70 70 0 0 1 395 380H255L190 450Q180 460 180 445V380H165A70 70 0 0 1 95 310V190A70 70 0 0 1 165 120Z';

const BACK_BUBBLE_PATH =
  'M440 215H660A70 70 0 0 1 730 285V355A70 70 0 0 1 660 425H658V490Q658 505 645 495L590 425H440A70 70 0 0 1 370 355V285A70 70 0 0 1 440 215Z';

/**
 * Logo Chibi Room: dua gelembung chat biru dengan titik tiga dan dua garis aksen merah.
 * Digambar sebagai SVG (sumber: public/logo-mark.svg) sehingga tajam di semua ukuran.
 * Id gradient & mask dibuat unik agar logo boleh tampil lebih dari satu kali di halaman.
 */
export default function AppLogo(props) {
  const size = props.size || 'sm';
  const uniqueId = useId().replace(/:/g, '');
  const frontGradientId = `front-${uniqueId}`;
  const backGradientId = `back-${uniqueId}`;
  const maskId = `mask-${uniqueId}`;

  return (
    <svg
      viewBox="40 30 740 540"
      fill="none"
      className={cn('shrink-0', SIZE_CLASSES[size], props.className)}
      role="img"
      aria-label="Chibi Room"
    >
      <defs>
        <linearGradient id={frontGradientId} x1="90" y1="100" x2="470" y2="460" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1F66F5" />
          <stop offset="1" stopColor="#2160F5" />
        </linearGradient>
        <linearGradient id={backGradientId} x1="380" y1="200" x2="730" y2="540" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C93FF" />
          <stop offset="1" stopColor="#6FA9FF" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="820" height="600">
          <rect width="820" height="600" fill="#fff" />
          <g transform="rotate(-9 280 255)" stroke="#000" strokeWidth="64" strokeLinejoin="round" fill="#000">
            <path d={FRONT_BUBBLE_PATH} />
          </g>
        </mask>
      </defs>

      {/* Gelembung belakang (biru muda), dipotong oleh gelembung depan */}
      <g mask={`url(#${maskId})`}>
        <g transform="rotate(6 550 330)">
          <path d={BACK_BUBBLE_PATH} stroke={`url(#${backGradientId})`} strokeWidth="44" strokeLinejoin="round" />
          <circle cx="490" cy="340" r="22" fill="#5BA0FF" />
          <circle cx="552" cy="340" r="22" fill="#5BA0FF" />
          <circle cx="614" cy="340" r="22" fill="#5BA0FF" />
        </g>
      </g>

      {/* Gelembung depan */}
      <g transform="rotate(-9 280 255)">
        <path d={FRONT_BUBBLE_PATH} stroke={`url(#${frontGradientId})`} strokeWidth="44" strokeLinejoin="round" />
        <circle cx="195" cy="250" r="24" fill="#2160F5" />
        <circle cx="270" cy="250" r="24" fill="#2160F5" />
        <circle cx="345" cy="250" r="24" fill="#2160F5" />
      </g>

      {/* Garis aksen */}
      <path d="M582 62V112" stroke="#F5606B" strokeWidth="36" strokeLinecap="round" />
      <path d="M664 140L706 98" stroke="#F5606B" strokeWidth="36" strokeLinecap="round" />
    </svg>
  );
}

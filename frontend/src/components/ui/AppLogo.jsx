import { useId } from 'react';
import { cn } from '../../lib/cn';

const SIZE_CLASSES = {
  sm: 'h-11 w-11',
  md: 'h-12 w-12',
  lg: 'h-[76px] w-[76px]',
};

/**
 * Logo Chibi Room: dua gelembung chat dengan wajah ramah dan kilau ungu (aksen AI).
 * Digambar sebagai SVG sehingga tajam di semua ukuran dan tidak butuh file gambar.
 */
export default function AppLogo(props) {
  const size = props.size || 'sm';
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn('shrink-0', SIZE_CLASSES[size], props.className)}
      role="img"
      aria-label="Chibi Room"
    >
      <defs>
        <linearGradient id={gradientId} x1="8" y1="14" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5C94FF" />
          <stop offset="1" stopColor="#2160F5" />
        </linearGradient>
      </defs>

      {/* Gelembung belakang */}
      <path
        d="M30 22h20a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-2v7l-8-7H30a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z"
        fill="#E8EFFF"
        stroke="#17233F"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Gelembung depan */}
      <path
        d="M14 14h22a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H26l-9 8v-8h-3a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8Z"
        fill={`url(#${gradientId})`}
        stroke="#17233F"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Wajah */}
      <circle cx="19" cy="28" r="2.4" fill="#fff" />
      <circle cx="31" cy="28" r="2.4" fill="#fff" />
      <path d="M21 34c2 2.2 6 2.2 8 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />

      {/* Kilau AI */}
      <path d="M52 3l2.3 6.5L61 12l-6.7 2.5L52 21l-2.3-6.5L43 12l6.7-2.5Z" fill="#7847E8" />
    </svg>
  );
}

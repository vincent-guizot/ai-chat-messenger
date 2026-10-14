import { cn } from '../../lib/cn';

/**
 * Satu baris di daftar sidebar (percakapan AI, DM, atau kontak).
 *
 * Props:
 *   avatar             elemen avatar
 *   title              teks utama
 *   subtitle           teks kecil di bawah judul
 *   subtitleClassName  warna khusus subtitle (mis. hijau untuk "Online")
 *   trailing           elemen di kanan (titik status / waktu / badge)
 *   isActive           baris sedang dipilih
 *   isCollapsed        sidebar diciutkan -> hanya avatar
 */
export default function SidebarListItem(props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
        props.isActive && 'bg-navy-700',
        !props.isActive && 'hover:bg-navy-800',
        props.isCollapsed && 'justify-center px-0',
      )}
    >
      {props.avatar}

      {!props.isCollapsed && (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{props.title}</div>
            {props.subtitle && (
              <div className={cn('truncate text-xs text-slate-400', props.subtitleClassName)}>{props.subtitle}</div>
            )}
          </div>

          {props.trailing}
        </>
      )}
    </button>
  );
}

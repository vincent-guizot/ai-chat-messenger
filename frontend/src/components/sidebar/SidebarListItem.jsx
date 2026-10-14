import { cn } from '../../lib/cn';

/**
 * Satu baris di daftar sidebar (percakapan AI, DM, atau kontak).
 *
 * Props:
 *   avatar       elemen avatar
 *   title        teks utama
 *   subtitle     teks kecil di bawah judul
 *   subtitleClassName  warna khusus subtitle (mis. hijau untuk "Online")
 *   trailing     elemen di kanan (titik status / waktu)
 *   isActive     baris sedang dipilih
 *   isCollapsed  sidebar diciutkan -> hanya avatar
 */
export default function SidebarListItem(props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition',
        props.isActive && 'border-white/10 bg-white/10',
        !props.isActive && 'border-transparent hover:bg-white/5',
        props.isCollapsed && 'justify-center px-0',
      )}
    >
      {props.avatar}

      {!props.isCollapsed && (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-white">{props.title}</div>
            {props.subtitle && (
              <div className={cn('truncate text-sm text-slate-300/80', props.subtitleClassName)}>{props.subtitle}</div>
            )}
          </div>

          {props.trailing}
        </>
      )}
    </button>
  );
}

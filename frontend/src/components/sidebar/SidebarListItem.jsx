import { cn } from '../../lib/cn';

/**
 * Satu baris di daftar sidebar (percakapan AI, DM, atau kontak).
 *
 * Props:
 *   avatar             elemen avatar
 *   title              teks utama
 *   time               waktu pesan terakhir (kanan atas)
 *   subtitle           teks status di bawah judul (mis. "Online")
 *   subtitleClassName  warna khusus subtitle (mis. hijau untuk "Online")
 *   preview            pratinjau pesan terakhir
 *   badge              elemen di kanan bawah (mis. jumlah belum dibaca)
 *   isActive           baris sedang dipilih
 *   isCollapsed        sidebar diciutkan -> hanya avatar
 */
export default function SidebarListItem(props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      aria-current={props.isActive ? 'true' : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors',
        props.isActive && 'bg-soft',
        !props.isActive && 'hover:bg-tint',
        props.isCollapsed && 'justify-center px-0',
      )}
    >
      {props.isActive && (
        <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-600" aria-hidden="true" />
      )}

      {props.avatar}

      {!props.isCollapsed && (
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[15px] font-semibold text-ink">{props.title}</span>
            {props.time && <span className="shrink-0 text-xs text-ink-muted">{props.time}</span>}
          </div>

          {props.subtitle && (
            <div className={cn('truncate text-sm text-ink-muted', props.subtitleClassName)}>{props.subtitle}</div>
          )}

          {(props.preview || props.badge) && (
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm text-ink-muted">{props.preview}</span>
              {props.badge}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

import { Trash2, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 *   onDelete           jika diisi, tombol hapus muncul saat baris di-hover / difokus
 */
export default function SidebarListItem(props) {
  const canDelete = Boolean(props.onDelete) && !props.isCollapsed;
  const canShowInfo = Boolean(props.onInfo) && !props.isCollapsed;

  let ariaCurrent;
  if (props.isActive) {
    ariaCurrent = 'true';
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={props.onClick}
        title={props.title}
        aria-current={ariaCurrent}
        className={cn(
          'relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
          props.isActive && 'bg-accent',
          props.isActive && props.isCollapsed && 'ring-1 ring-primary/40',
          !props.isActive && 'hover:bg-muted',
          props.isCollapsed && 'justify-center px-0',
        )}
      >
        {props.isActive && !props.isCollapsed && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" aria-hidden="true" />}

        {props.avatar}

        {!props.isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-base font-semibold text-foreground">{props.title}</span>
              {props.time && (
                <span className={cn('shrink-0 text-xs text-muted-foreground', canDelete && 'group-hover:invisible')}>
                  {props.time}
                </span>
              )}
            </div>

            {props.subtitle && (
              <div className={cn('truncate text-sm text-muted-foreground', props.subtitleClassName)}>{props.subtitle}</div>
            )}

            {(props.preview || props.badge) && (
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">{props.preview}</span>
                {props.badge}
              </div>
            )}
          </div>
        )}
      </button>

      {canShowInfo && (
        <button
          type="button"
          onClick={props.onInfo}
          aria-label={`View ${props.title}'s profile`}
          title="View profile"
          className={cn(
            'absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition',
            'hover:bg-accent hover:text-primary focus-visible:opacity-100',
            'opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100',
          )}
        >
          <UserRound className="size-4" aria-hidden="true" />
        </button>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={props.onDelete}
          aria-label={`Delete chat with ${props.title}`}
          title="Delete chat"
          className={cn(
            'absolute right-2 top-2 flex size-7 items-center justify-center rounded-md text-muted-foreground transition',
            'hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100',
            'opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100',
          )}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

import { cn } from '@/lib/utils';

/**
 * Nama merek: "Chibi" (navy) + "Room" (biru) dan tagline "CHINDO BESTIE", mengikuti wordmark logo.
 */
export default function BrandName(props) {
  return (
    <div className={cn('min-w-0 text-left', props.className)}>
      <div className="truncate text-xl font-extrabold leading-none tracking-tight text-foreground">
        Chibi <span className="text-primary dark:text-brand-400">Room</span>
      </div>

      {!props.hideTagline && (
        <div className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Chindo Bestie
        </div>
      )}
    </div>
  );
}

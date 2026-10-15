import { cn } from '../../lib/cn';

/**
 * Nama merek: "Chibi" (navy) + "Room" (biru) dan tagline "CHINDO BESTIE".
 * Mengikuti wordmark pada logo.
 */
export default function BrandName(props) {
  return (
    <div className={cn('min-w-0 text-left', props.className)}>
      <div className="truncate text-xl font-extrabold leading-none tracking-tight text-ink">
        Chibi <span className="text-brand-600 dark:text-brand-400">Room</span>
      </div>
      {!props.hideTagline && (
        <div className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.28em] text-ink-muted">Chindo Bestie</div>
      )}
    </div>
  );
}

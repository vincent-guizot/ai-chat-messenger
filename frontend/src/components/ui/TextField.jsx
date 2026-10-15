import { forwardRef } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Input dengan label, ikon di kiri, elemen tambahan di kanan (mis. tombol lihat password),
 * dan pesan error. Tinggi 44px, teks 14px (mengikuti ukuran teks dasar design system).
 */
const TextField = forwardRef(function TextField(props, ref) {
  const { id, label, icon: Icon, trailing, error, className, ...inputProps } = props;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
        {label}
      </label>

      <div
        className={cn(
          'flex h-11 items-center gap-2.5 rounded-md border bg-surface px-3.5 transition-colors',
          'focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15',
          error && 'border-danger',
          !error && 'border-line',
          inputProps.disabled && 'opacity-60',
        )}
      >
        {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-ink-muted" aria-hidden="true" />}

        <input
          id={id}
          ref={ref}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />

        {trailing}
      </div>

      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export default TextField;

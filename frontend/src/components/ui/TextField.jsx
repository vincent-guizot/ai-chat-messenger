import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Input dengan label, ikon di kiri, elemen tambahan di kanan (mis. tombol lihat password),
 * dan pesan error. Dipakai di halaman login (latar navy).
 */
const TextField = forwardRef(function TextField(props, ref) {
  const { id, label, icon: Icon, trailing, error, className, ...inputProps } = props;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-slate-300">
        {label}
      </label>

      <div
        className={cn(
          'flex h-10 items-center gap-2.5 rounded-lg border bg-navy-950 px-3 transition-colors',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25',
          error && 'border-danger/70',
          !error && 'border-navy-700',
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}

        <input
          id={id}
          ref={ref}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />

        {trailing}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default TextField;

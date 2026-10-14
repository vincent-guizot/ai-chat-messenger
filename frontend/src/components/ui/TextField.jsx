import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Input dengan label, ikon di kiri, elemen tambahan di kanan (mis. tombol lihat password),
 * dan pesan error. Dipakai di halaman login (latar gelap).
 */
const TextField = forwardRef(function TextField(props, ref) {
  const { id, label, icon: Icon, trailing, error, className, ...inputProps } = props;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-100">
        {label}
      </label>

      <div
        className={cn(
          'flex h-13 items-center gap-3 rounded-xl border bg-white/[0.04] px-4 transition',
          'focus-within:border-brand-400 focus-within:bg-white/[0.07] focus-within:ring-4 focus-within:ring-brand-500/20',
          error && 'border-rose-400/70',
          !error && 'border-white/10',
        )}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />}

        <input
          id={id}
          ref={ref}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-400 focus:outline-none',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />

        {trailing}
      </div>

      {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
    </div>
  );
});

export default TextField;

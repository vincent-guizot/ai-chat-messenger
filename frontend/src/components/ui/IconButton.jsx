import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const iconButtonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // Tombol kotak dengan garis (header chat)
        card:
          'rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-white',
        // Tombol transparan (ikon di input pesan)
        ghost:
          'rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-slate-100',
        // Tombol transparan di atas latar navy (sidebar)
        sidebar: 'rounded-lg text-slate-400 hover:bg-navy-800 hover:text-white',
        // Tombol biru (kirim pesan)
        primary: 'rounded-lg bg-brand-600 text-white hover:bg-brand-700',
        // Tombol abu-abu (tombol "+")
        muted:
          'rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-300 dark:hover:bg-navy-700',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

/**
 * Tombol yang hanya berisi ikon. "label" wajib diisi untuk aksesibilitas (dibaca screen reader).
 */
export default function IconButton(props) {
  const { className, variant, size, label, children, type, ...otherProps } = props;

  return (
    <button
      type={type || 'button'}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant: variant, size: size }), className)}
      {...otherProps}
    >
      {children}
    </button>
  );
}

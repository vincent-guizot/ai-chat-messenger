import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // Tombol kotak putih dengan bayangan (header chat)
        card:
          'rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white',
        // Tombol transparan (ikon di input pesan)
        ghost:
          'rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100',
        // Tombol transparan di atas latar gelap (sidebar)
        sidebar:
          'rounded-xl text-slate-300 hover:bg-white/10 hover:text-white',
        // Tombol bulat biru (kirim pesan)
        primary:
          'rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow hover:from-brand-400 hover:to-brand-600',
        // Tombol bulat abu-abu (tombol "+")
        muted:
          'rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
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

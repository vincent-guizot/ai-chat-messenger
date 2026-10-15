import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const iconButtonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // Tombol kotak dengan garis (header chat)
        card: 'rounded-md border border-line bg-surface text-ink-muted shadow-sm hover:border-brand-300 hover:text-brand-600',
        // Tombol transparan
        ghost: 'rounded-md text-ink-muted hover:bg-tint hover:text-ink',
        // Alias lama untuk ghost (dipakai di sidebar)
        sidebar: 'rounded-md text-ink-muted hover:bg-tint hover:text-ink',
        // Tombol biru (kirim pesan)
        primary: 'rounded-md bg-brand-600 text-white shadow-md hover:bg-brand-700 disabled:shadow-none',
        // Tombol netral berlatar (tombol "+")
        muted: 'rounded-md border border-line bg-canvas text-ink-muted hover:border-brand-300 hover:text-brand-600',
      },
      // Ukuran tombol (rem, root 14px): sm 28px, md 35px, lg 38px — untuk aksi sekunder yang rapat.
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-11 w-11',
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

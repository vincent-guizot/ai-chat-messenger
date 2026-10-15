import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        // Tombol utama: biru solid
        primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
        // Tombol sekunder: biru lembut
        secondary: 'bg-soft text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-900/40',
        // Tombol putih dengan garis
        outline: 'border border-line bg-surface text-ink hover:border-brand-300 hover:bg-tint',
        // Alias lama untuk "outline" (dipakai di beberapa halaman)
        soft: 'border border-line bg-surface text-ink hover:border-brand-300 hover:bg-tint',
        // Aksen AI (ungu)
        ai: 'border border-ai-line bg-ai-soft text-ai-700 hover:border-ai-400 dark:text-ai-300',
        ghost: 'text-ink-muted hover:bg-tint hover:text-ink',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-11 rounded-md px-3 text-sm',
        md: 'h-12 rounded-md px-5 text-base',
        lg: 'h-12 rounded-md px-6 text-base',
        pill: 'h-11 rounded-full px-4 text-sm font-medium',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export default function Button(props) {
  const { className, variant, size, fullWidth, type, ...otherProps } = props;

  return (
    <button
      type={type || 'button'}
      className={cn(buttonVariants({ variant: variant, size: size, fullWidth: fullWidth }), className)}
      {...otherProps}
    />
  );
}

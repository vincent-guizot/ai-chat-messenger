import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        // Tombol utama: biru solid
        primary: 'bg-brand-600 text-white hover:bg-brand-700',
        // Tombol di atas latar navy (halaman login)
        outline: 'border border-navy-600 bg-navy-800 text-slate-100 hover:border-brand-500 hover:bg-navy-700',
        // Tombol putih dengan garis (latar terang)
        soft:
          'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-200 dark:hover:border-brand-500',
        ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800',
      },
      size: {
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-10 rounded-lg px-4 text-sm',
        lg: 'h-11 rounded-lg px-5 text-sm',
        pill: 'h-8 rounded-full px-3.5 text-xs',
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

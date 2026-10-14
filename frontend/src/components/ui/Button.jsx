import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow hover:-translate-y-px hover:from-brand-400 hover:to-brand-600 active:translate-y-0',
        outline:
          'border border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10',
        soft:
          'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
        ghost:
          'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
      },
      size: {
        sm: 'h-9 rounded-xl px-3 text-sm',
        md: 'h-11 rounded-xl px-4 text-sm',
        lg: 'h-13 rounded-2xl px-6 text-base',
        pill: 'h-9 rounded-full px-4 text-sm font-medium',
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

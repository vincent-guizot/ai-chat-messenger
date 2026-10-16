import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Tombol (shadcn/ui). Varian & ukuran disesuaikan dengan design system Chibi Room.
 * Gunakan `asChild` untuk memakai elemen lain (mis. <a>) dengan gaya tombol.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold',
    'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-60',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // Tombol utama: biru solid
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-brand-700',
        // Tombol biru lembut
        secondary: 'bg-secondary text-secondary-foreground hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-900/40',
        // Tombol putih dengan garis
        outline: 'border border-border bg-card text-foreground shadow-sm hover:border-brand-300 hover:bg-muted',
        // Tombol transparan
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        // Tombol merah (aksi hapus)
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // Teks biru seperti tautan
        link: 'text-primary underline-offset-4 hover:underline',
        // Chip saran AI (biru lembut dengan garis)
        soft: 'border border-ai-line bg-ai-soft text-brand-700 hover:border-brand-400 dark:text-brand-300',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-6 text-base',
        pill: 'h-8 rounded-full px-3.5 text-xs font-medium',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = forwardRef(function Button(props, ref) {
  const { className, variant, size, asChild, type, ...otherProps } = props;

  let Component = 'button';
  if (asChild) {
    Component = Slot;
  }

  let buttonType = type;
  if (!asChild && !buttonType) {
    buttonType = 'button';
  }

  return (
    <Component
      ref={ref}
      type={buttonType}
      data-slot="button"
      className={cn(buttonVariants({ variant: variant, size: size }), className)}
      {...otherProps}
    />
  );
});

export { Button };

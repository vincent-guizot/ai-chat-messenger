import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground dark:text-brand-300',
        success: 'bg-success text-white',
        warning: 'bg-warning text-navy-800',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge(props) {
  const { className, variant, asChild, ...otherProps } = props;

  let Component = 'span';
  if (asChild) {
    Component = Slot;
  }

  return <Component data-slot="badge" className={cn(badgeVariants({ variant: variant }), className)} {...otherProps} />;
}

export { Badge };

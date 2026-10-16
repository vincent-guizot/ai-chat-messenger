import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input(props, ref) {
  const { className, type, ...otherProps } = props;

  return (
    <input
      ref={ref}
      type={type || 'text'}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-colors',
        'placeholder:text-muted-foreground/70 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...otherProps}
    />
  );
});

export { Input };

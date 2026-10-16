import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(function Textarea(props, ref) {
  const { className, ...otherProps } = props;

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'flex w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors',
        'placeholder:text-muted-foreground/70 outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...otherProps}
    />
  );
});

export { Textarea };

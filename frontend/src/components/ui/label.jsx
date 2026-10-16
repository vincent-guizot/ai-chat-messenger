import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

function Label(props) {
  const { className, ...otherProps } = props;

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex select-none items-center gap-2 text-sm font-semibold leading-none text-foreground',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...otherProps}
    />
  );
}

export { Label };

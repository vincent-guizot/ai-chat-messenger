import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

function Separator(props) {
  const { className, orientation, decorative, ...otherProps } = props;

  let isDecorative = true;
  if (decorative === false) {
    isDecorative = false;
  }

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={isDecorative}
      orientation={orientation || 'horizontal'}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...otherProps}
    />
  );
}

export { Separator };

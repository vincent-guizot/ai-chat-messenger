import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

function Popover(props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor(props) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent(props) {
  const { className, align, sideOffset, ...otherProps } = props;

  let alignment = 'center';
  if (align) {
    alignment = align;
  }

  let offset = 8;
  if (sideOffset !== undefined) {
    offset = sideOffset;
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={alignment}
        sideOffset={offset}
        className={cn(
          'z-50 w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-popover outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...otherProps}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

function ScrollArea(props) {
  const { className, children, viewportRef, viewportClassName, ...otherProps } = props;

  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn('relative overflow-hidden', className)} {...otherProps}>
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn('size-full rounded-[inherit] outline-none', viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar(props) {
  const { className, orientation, ...otherProps } = props;

  let direction = 'vertical';
  if (orientation) {
    direction = orientation;
  }

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={direction}
      className={cn(
        'flex touch-none select-none p-px transition-colors',
        direction === 'vertical' && 'h-full w-2 border-l border-l-transparent',
        direction === 'horizontal' && 'h-2 flex-col border-t border-t-transparent',
        className,
      )}
      {...otherProps}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/40"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

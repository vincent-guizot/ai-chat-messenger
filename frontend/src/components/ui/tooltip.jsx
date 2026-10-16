import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

function TooltipProvider(props) {
  const { delayDuration, ...otherProps } = props;

  let delay = 300;
  if (delayDuration !== undefined) {
    delay = delayDuration;
  }

  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delay} {...otherProps} />;
}

function Tooltip(props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger(props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent(props) {
  const { className, sideOffset, children, ...otherProps } = props;

  let offset = 6;
  if (sideOffset !== undefined) {
    offset = sideOffset;
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={offset}
        className={cn(
          'z-50 w-fit max-w-xs rounded-md bg-navy-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-md',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
          className,
        )}
        {...otherProps}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

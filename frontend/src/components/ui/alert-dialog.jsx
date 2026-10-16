import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogOverlay(props) {
  const { className, ...otherProps } = props;

  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-navy-800/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...otherProps}
    />
  );
}

function AlertDialogContent(props) {
  const { className, ...otherProps } = props;

  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-5 shadow-popover sm:max-w-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...otherProps}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader(props) {
  const { className, ...otherProps } = props;

  return <div data-slot="alert-dialog-header" className={cn('flex flex-col gap-1.5', className)} {...otherProps} />;
}

function AlertDialogFooter(props) {
  const { className, ...otherProps } = props;

  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...otherProps}
    />
  );
}

function AlertDialogTitle(props) {
  const { className, ...otherProps } = props;

  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-base font-semibold text-foreground', className)}
      {...otherProps}
    />
  );
}

function AlertDialogDescription(props) {
  const { className, ...otherProps } = props;

  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...otherProps}
    />
  );
}

function AlertDialogAction(props) {
  const { className, variant, ...otherProps } = props;

  return <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant: variant, size: 'sm' }), className)} {...otherProps} />;
}

function AlertDialogCancel(props) {
  const { className, ...otherProps } = props;

  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), className)}
      {...otherProps}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

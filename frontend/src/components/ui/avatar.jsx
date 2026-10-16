import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

function Avatar(props) {
  const { className, ...otherProps } = props;

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0 select-none overflow-hidden rounded-full', className)}
      {...otherProps}
    />
  );
}

function AvatarImage(props) {
  const { className, ...otherProps } = props;

  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square size-full', className)} {...otherProps} />;
}

function AvatarFallback(props) {
  const { className, ...otherProps } = props;

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center rounded-full bg-muted font-semibold', className)}
      {...otherProps}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

import { cn } from '@/lib/utils';

function Skeleton(props) {
  const { className, ...otherProps } = props;

  return <div data-slot="skeleton" className={cn('animate-pulse rounded-md bg-border', className)} {...otherProps} />;
}

export { Skeleton };

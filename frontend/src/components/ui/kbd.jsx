import { cn } from '@/lib/utils';

/**
 * Label pintasan keyboard kecil, mis. "Alt N".
 */
function Kbd(props) {
  const { className, ...otherProps } = props;

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-5 items-center rounded-sm bg-white/20 px-1.5 font-sans text-[11px] font-medium text-current',
        className,
      )}
      {...otherProps}
    />
  );
}

export { Kbd };

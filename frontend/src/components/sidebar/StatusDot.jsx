import { cn } from '../../lib/cn';

export default function StatusDot(props) {
  return (
    <span
      className={cn(
        'h-2.5 w-2.5 shrink-0 rounded-full',
        props.isOnline && 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        !props.isOnline && 'bg-slate-400/70',
      )}
      aria-hidden="true"
    />
  );
}

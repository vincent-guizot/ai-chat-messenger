import { cn } from '../../lib/cn';

export default function StatusDot(props) {
  return (
    <span
      className={cn('h-2 w-2 shrink-0 rounded-full', props.isOnline && 'bg-success', !props.isOnline && 'bg-slate-500')}
      aria-hidden="true"
    />
  );
}

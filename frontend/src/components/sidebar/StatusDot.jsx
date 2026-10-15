import { cn } from '../../lib/cn';

export default function StatusDot(props) {
  return (
    <span
      className={cn('h-2.5 w-2.5 shrink-0 rounded-full', props.isOnline && 'bg-success', !props.isOnline && 'bg-ink-muted/60')}
      role="img"
      aria-label={props.isOnline ? 'Online' : 'Offline'}
    />
  );
}

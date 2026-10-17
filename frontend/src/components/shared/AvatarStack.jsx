import UserAvatar from '@/components/shared/UserAvatar';
import { cn } from '@/lib/utils';

/**
 * Deretan avatar yang saling menumpuk, diakhiri angka "+N" jika masih ada sisa.
 */
export default function AvatarStack(props) {
  const max = props.max || 4;
  const size = props.size || 'sm';
  const visible = props.people.slice(0, max);
  const rest = props.people.length - visible.length;

  return (
    <div className={cn('flex items-center -space-x-2', props.className)}>
      {visible.map((person) => (
        <UserAvatar key={person.id} name={person.name} size={size} className="ring-2 ring-card" />
      ))}

      {rest > 0 && (
        <span className="relative z-10 flex h-8 min-w-8 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      )}
    </div>
  );
}

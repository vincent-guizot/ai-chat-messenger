import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/utils/formatters';

const SIZE_CLASSES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-14 text-lg',
};

const STATUS_DOT_SIZES = {
  xs: 'size-2',
  sm: 'size-2.5',
  md: 'size-3',
  lg: 'size-3.5',
  xl: 'size-4',
};

const ICON_SIZES = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-7',
};

// Warna titik status. Selalu ada label teks (aria-label) agar tidak hanya mengandalkan warna.
const STATUS_COLORS = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-destructive',
  offline: 'bg-muted-foreground/60',
};

/**
 * Mengubah boolean online menjadi nilai prop "status" untuk UserAvatar.
 */
export function toPresenceStatus(isOnline) {
  if (isOnline) {
    return 'online';
  }

  return 'offline';
}

/**
 * Avatar user (inisial berwarna) atau avatar AI (ikon robot), dibangun di atas Avatar shadcn/ui.
 *
 * Props:
 *   name         nama user, dipakai untuk inisial & warna
 *   isAssistant  true untuk AI Assistant
 *   status       "online" | "away" | "busy" | "offline" | undefined (tanpa titik status)
 *   size         "xs" | "sm" | "md" | "lg" | "xl"
 */
export default function UserAvatar(props) {
  const size = props.size || 'md';

  let backgroundClass = getAvatarColor(props.name);
  let content = getInitials(props.name, '?');

  if (props.isAssistant) {
    backgroundClass = 'bg-ai-600';
    content = <Bot className={ICON_SIZES[size]} aria-hidden="true" />;
  }

  return (
    <Avatar className={cn('overflow-visible', SIZE_CLASSES[size], props.className)} title={props.name}>
      <AvatarFallback className={cn('text-white', backgroundClass)}>{content}</AvatarFallback>

      {props.status && (
        <span
          className={cn(
            'absolute -bottom-px -right-px rounded-full ring-2 ring-card',
            STATUS_DOT_SIZES[size],
            STATUS_COLORS[props.status] || STATUS_COLORS.offline,
          )}
          role="img"
          aria-label={props.status}
        />
      )}
    </Avatar>
  );
}

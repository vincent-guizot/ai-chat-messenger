import { cva } from 'class-variance-authority';
import { Bot } from 'lucide-react';
import { cn } from '../../lib/cn';
import { getAvatarColor, getInitials } from '../../utils/formatters';

const avatarVariants = cva(
  'relative flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-14 w-14 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const STATUS_DOT_SIZES = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
};

const ICON_SIZES = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

// Warna titik status. Selalu ada label teks (aria-label) agar tidak hanya mengandalkan warna.
const STATUS_COLORS = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-danger',
  offline: 'bg-ink-muted/60',
};

/**
 * Mengubah boolean online menjadi nilai prop "status" untuk Avatar.
 */
export function toPresenceStatus(isOnline) {
  if (isOnline) {
    return 'online';
  }

  return 'offline';
}

/**
 * Avatar user (inisial berwarna) atau avatar AI (ikon robot, ungu).
 *
 * Props:
 *   name         nama user, dipakai untuk inisial & warna
 *   isAssistant  true untuk AI Assistant
 *   status       "online" | "away" | "busy" | "offline" | undefined (tanpa titik status)
 *   size         "xs" | "sm" | "md" | "lg" | "xl"
 */
export default function Avatar(props) {
  const size = props.size || 'md';

  let backgroundClass = getAvatarColor(props.name);
  if (props.isAssistant) {
    backgroundClass = 'bg-ai-600';
  }

  let content = getInitials(props.name, '?');
  if (props.isAssistant) {
    content = <Bot className={ICON_SIZES[size]} aria-hidden="true" />;
  }

  return (
    <div className={cn(avatarVariants({ size: size }), backgroundClass, props.className)} title={props.name}>
      {content}

      {props.status && (
        <span
          className={cn(
            'absolute -bottom-px -right-px rounded-full ring-2 ring-surface',
            STATUS_DOT_SIZES[size],
            STATUS_COLORS[props.status] || STATUS_COLORS.offline,
            props.statusRingClassName,
          )}
          role="img"
          aria-label={props.status}
        />
      )}
    </div>
  );
}

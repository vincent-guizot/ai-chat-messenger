import { cva } from 'class-variance-authority';
import { Bot } from 'lucide-react';
import { cn } from '../../lib/cn';
import { getAvatarGradient, getInitials } from '../../utils/formatters';

const avatarVariants = cva(
  'relative flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white',
  {
    variants: {
      size: {
        xs: 'h-7 w-7 text-[10px]',
        sm: 'h-9 w-9 text-xs',
        md: 'h-11 w-11 text-sm',
        lg: 'h-14 w-14 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const STATUS_DOT_SIZES = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const ICON_SIZES = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
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
 * Avatar user (inisial berwarna) atau avatar AI (ikon robot).
 *
 * Props:
 *   name       nama user, dipakai untuk inisial & warna
 *   isAssistant  true untuk AI Assistant
 *   status     "online" | "offline" | undefined (tanpa titik status)
 *   size       "xs" | "sm" | "md" | "lg"
 */
export default function Avatar(props) {
  const size = props.size || 'md';

  let backgroundClass = cn('bg-gradient-to-br', getAvatarGradient(props.name));
  if (props.isAssistant) {
    backgroundClass = 'bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow';
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
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white dark:ring-navy-900',
            STATUS_DOT_SIZES[size],
            props.status === 'online' && 'bg-emerald-400',
            props.status !== 'online' && 'bg-slate-400',
            props.statusRingClassName,
          )}
          aria-label={props.status}
        />
      )}
    </div>
  );
}

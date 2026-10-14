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
        sm: 'h-8 w-8 text-[11px]',
        md: 'h-9 w-9 text-xs',
        lg: 'h-10 w-10 text-sm',
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
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

const ICON_SIZES = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-[18px] w-[18px]',
  lg: 'h-5 w-5',
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
 *   name         nama user, dipakai untuk inisial & warna
 *   isAssistant  true untuk AI Assistant
 *   status       "online" | "offline" | undefined (tanpa titik status)
 *   size         "xs" | "sm" | "md" | "lg"
 *   statusRingClassName  warna cincin titik status (samakan dengan warna latar)
 */
export default function Avatar(props) {
  const size = props.size || 'md';

  let backgroundClass = getAvatarColor(props.name);
  if (props.isAssistant) {
    backgroundClass = 'bg-brand-600';
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
            'absolute -bottom-px -right-px rounded-full ring-2 ring-white dark:ring-navy-950',
            STATUS_DOT_SIZES[size],
            props.status === 'online' && 'bg-success',
            props.status !== 'online' && 'bg-slate-400',
            props.statusRingClassName,
          )}
          aria-label={props.status}
        />
      )}
    </div>
  );
}

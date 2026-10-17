import { UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/utils/formatters';

const SIZE_CLASSES = {
  sm: 'size-8 rounded-lg text-xs',
  md: 'size-10 rounded-xl text-sm',
  lg: 'size-14 rounded-2xl text-lg',
  xl: 'size-20 rounded-3xl text-2xl',
};

/**
 * Avatar grup: kotak membulat berwarna dengan inisial nama grup.
 * Dibedakan dari avatar user (lingkaran) supaya grup mudah dikenali di daftar.
 */
export default function GroupAvatar(props) {
  const size = props.size || 'md';

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center font-semibold text-white',
        SIZE_CLASSES[size],
        getAvatarColor(props.name),
        props.className,
      )}
      title={props.name}
    >
      {getInitials(props.name, '') || <UsersRound className="size-1/2" aria-hidden="true" />}
    </span>
  );
}

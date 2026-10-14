import { Bot, MessageSquareMore } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const logoVariants = cva(
  'flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 text-white shadow-glow',
  {
    variants: {
      size: {
        sm: 'h-11 w-11 rounded-xl',
        lg: 'h-24 w-24 rounded-[1.75rem]',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

/**
 * Logo aplikasi. variant "bot" untuk halaman login, "chat" untuk sidebar.
 */
export default function AppLogo(props) {
  const size = props.size || 'sm';

  let Icon = MessageSquareMore;
  if (props.variant === 'bot') {
    Icon = Bot;
  }

  let iconClass = 'h-6 w-6';
  if (size === 'lg') {
    iconClass = 'h-12 w-12';
  }

  return (
    <div className={cn(logoVariants({ size: size }), props.className)}>
      <Icon className={iconClass} strokeWidth={2.2} aria-hidden="true" />
    </div>
  );
}

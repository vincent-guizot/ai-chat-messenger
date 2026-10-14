import { Bot, MessageSquareMore } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const logoVariants = cva('flex shrink-0 items-center justify-center bg-brand-600 text-white', {
  variants: {
    size: {
      sm: 'h-8 w-8 rounded-lg',
      lg: 'h-14 w-14 rounded-2xl',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

const ICON_SIZES = {
  sm: 'h-[18px] w-[18px]',
  lg: 'h-7 w-7',
};

/**
 * Logo aplikasi. variant "bot" untuk halaman login, "chat" untuk sidebar.
 */
export default function AppLogo(props) {
  const size = props.size || 'sm';

  let Icon = MessageSquareMore;
  if (props.variant === 'bot') {
    Icon = Bot;
  }

  return (
    <div className={cn(logoVariants({ size: size }), props.className)}>
      <Icon className={ICON_SIZES[size]} strokeWidth={2.2} aria-hidden="true" />
    </div>
  );
}

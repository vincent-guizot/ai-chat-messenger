import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/shared/UserAvatar';

const DOTS = [0, 1, 2];

/**
 * Gelembung "sedang mengetik" dengan tiga titik yang bergerak (biru muda untuk AI).
 */
export default function TypingBubble(props) {
  let typingName = 'Someone';
  if (props.isAssistant) {
    typingName = 'AI Assistant';
  }
  if (props.name) {
    typingName = props.name;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5"
      role="status"
      aria-label={`${typingName} is typing`}
    >
      <UserAvatar name={props.name} isAssistant={props.isAssistant} size="sm" />

      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg rounded-bl-sm border px-3.5 py-3 shadow-sm',
          props.isAssistant && 'border-ai-line bg-ai-soft',
          !props.isAssistant && 'border-border bg-card',
        )}
      >
        {DOTS.map((dot) => (
          <motion.span
            key={dot}
            className={cn('size-2 rounded-full', props.isAssistant && 'bg-brand-400', !props.isAssistant && 'bg-primary')}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

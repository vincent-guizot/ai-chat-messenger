import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import Avatar from '../ui/Avatar';

const DOTS = [0, 1, 2];

/**
 * Gelembung "sedang mengetik" dengan tiga titik yang bergerak (ungu untuk AI).
 */
export default function TypingBubble(props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3"
      role="status"
      aria-label={`${props.name || (props.isAssistant ? 'AI Assistant' : 'Someone')} is typing`}
    >
      <Avatar name={props.name} isAssistant={props.isAssistant} size="md" />

      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg rounded-bl-sm border px-4 py-3.5 shadow-sm',
          props.isAssistant && 'border-ai-line bg-ai-soft',
          !props.isAssistant && 'border-line bg-surface',
        )}
      >
        {DOTS.map((dot) => (
          <motion.span
            key={dot}
            className={cn('h-2 w-2 rounded-full', props.isAssistant ? 'bg-ai-600' : 'bg-brand-600')}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

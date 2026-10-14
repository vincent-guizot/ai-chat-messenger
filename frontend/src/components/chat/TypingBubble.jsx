import { motion } from 'motion/react';
import Avatar from '../ui/Avatar';

const DOTS = [0, 1, 2];

/**
 * Gelembung "sedang mengetik" dengan tiga titik yang bergerak.
 */
export default function TypingBubble(props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5"
      aria-label={`${props.name || 'Someone'} is typing`}
    >
      <Avatar name={props.name} isAssistant={props.isAssistant} size="sm" />

      <div className="flex items-center gap-1 rounded-xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-3 dark:border-navy-700 dark:bg-navy-900">
        {DOTS.map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-brand-500"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

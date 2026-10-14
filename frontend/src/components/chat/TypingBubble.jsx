import { motion } from 'motion/react';
import Avatar from '../ui/Avatar';

const DOTS = [0, 1, 2];

/**
 * Gelembung "sedang mengetik" dengan tiga titik yang bergerak.
 */
export default function TypingBubble(props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 sm:gap-4"
      aria-label={`${props.name || 'Someone'} is typing`}
    >
      <Avatar name={props.name} isAssistant={props.isAssistant} size="md" />

      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-5 py-4 shadow-card dark:border-white/10 dark:bg-white/[0.06]">
        {DOTS.map((dot) => (
          <motion.span
            key={dot}
            className="h-2 w-2 rounded-full bg-brand-500"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

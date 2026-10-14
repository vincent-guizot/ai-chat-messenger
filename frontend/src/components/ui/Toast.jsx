import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export default function Toast() {
  const toastMessage = useChatStore((state) => state.toastMessage);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card dark:border-white/10 dark:bg-navy-800 dark:text-slate-100"
          >
            <CircleAlert className="h-4 w-4 text-brand-500" aria-hidden="true" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

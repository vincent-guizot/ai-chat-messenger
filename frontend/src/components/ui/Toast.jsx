import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { cn } from '../../lib/cn';

// Ikon & warna aksen untuk setiap jenis toast.
const TOAST_STYLES = {
  info: { icon: Info, accentClass: 'text-info', barClass: 'bg-info' },
  success: { icon: CircleCheck, accentClass: 'text-success', barClass: 'bg-success' },
  warning: { icon: TriangleAlert, accentClass: 'text-warning', barClass: 'bg-warning' },
  error: { icon: CircleAlert, accentClass: 'text-danger', barClass: 'bg-danger' },
};

export default function Toast() {
  const toastMessage = useChatStore((state) => state.toastMessage);
  const toastVariant = useChatStore((state) => state.toastVariant);

  const style = TOAST_STYLES[toastVariant] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-16 z-[60] flex justify-end sm:left-auto">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="pointer-events-auto flex max-w-sm items-center gap-2.5 overflow-hidden rounded-lg border border-line bg-surface py-2.5 pl-3 pr-4 text-sm text-ink shadow-popover"
          >
            <span className={cn('h-5 w-1 shrink-0 rounded-full', style.barClass)} aria-hidden="true" />
            <Icon className={cn('h-4 w-4 shrink-0', style.accentClass)} aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

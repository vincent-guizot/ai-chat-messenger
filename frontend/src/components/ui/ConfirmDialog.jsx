import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { TriangleAlert } from 'lucide-react';
import Button from './Button';

/**
 * Dialog konfirmasi (mis. sebelum menghapus pesan / chat).
 * Dirender lewat portal ke <body> agar tidak terpotong oleh sidebar atau animasi di sekitarnya.
 *
 * Props:
 *   isOpen, title, description, confirmLabel, isLoading, onConfirm, onCancel
 */
export default function ConfirmDialog(props) {
  const isOpen = props.isOpen;
  const onCancel = props.onCancel;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.14 }}
            className="relative w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-popover"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h2 id="confirm-title" className="text-base font-semibold text-ink">
                  {props.title}
                </h2>
                <p id="confirm-description" className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {props.description}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onCancel} disabled={props.isLoading}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={props.onConfirm} disabled={props.isLoading} autoFocus>
                {props.confirmLabel || 'Delete'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

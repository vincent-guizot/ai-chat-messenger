import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/cn';

/**
 * Menu sederhana yang muncul saat tombol pemicu diklik.
 *
 * Props:
 *   trigger   function(isOpen, toggle) -> elemen tombol
 *   items     [{ label, icon, onSelect, danger }]
 *   align     "left" | "right"
 *   placement "top" | "bottom"
 */
export default function DropdownMenu(props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Tutup menu saat klik di luar atau menekan Escape.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function toggle() {
    setIsOpen(!isOpen);
  }

  function handleSelect(item) {
    setIsOpen(false);
    item.onSelect();
  }

  const isPlacedOnTop = props.placement === 'top';
  const isAlignedLeft = props.align === 'left';

  // Menu muncul sedikit bergeser ke arah tombol, lalu bergerak ke posisi akhirnya.
  let offsetY = -6;
  if (isPlacedOnTop) {
    offsetY = 6;
  }

  return (
    <div ref={containerRef} className="relative">
      {props.trigger(isOpen, toggle)}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: offsetY, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: offsetY, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              'absolute z-50 min-w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card',
              'dark:border-white/10 dark:bg-navy-800',
              isAlignedLeft && 'left-0',
              !isAlignedLeft && 'right-0',
              isPlacedOnTop && 'bottom-full mb-2',
              !isPlacedOnTop && 'top-full mt-2',
            )}
          >
            {props.items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                    item.danger && 'text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10',
                    !item.danger && 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10',
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

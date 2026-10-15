import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/cn';

/**
 * Kotak melayang yang muncul saat tombol pemicu diklik.
 * Tertutup otomatis saat klik di luar atau menekan Escape.
 *
 * Props:
 *   trigger    function(isOpen, toggle) -> elemen tombol
 *   children   function(close) -> isi popover
 *   align      "left" | "right"
 *   placement  "top" | "bottom"
 *   className  class tambahan untuk kotak popover (mis. lebar)
 */
export default function Popover(props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  function close() {
    setIsOpen(false);
  }

  const isPlacedOnTop = props.placement === 'top';
  const isAlignedLeft = props.align === 'left';

  // Popover muncul sedikit bergeser ke arah tombol, lalu bergerak ke posisi akhirnya.
  let offsetY = -4;
  if (isPlacedOnTop) {
    offsetY = 4;
  }

  return (
    <div ref={containerRef} className="relative">
      {props.trigger(isOpen, toggle)}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: offsetY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offsetY }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-50 overflow-hidden rounded-lg border border-line bg-surface shadow-popover',
              '',
              isAlignedLeft && 'left-0',
              !isAlignedLeft && 'right-0',
              isPlacedOnTop && 'bottom-full mb-2',
              !isPlacedOnTop && 'top-full mt-2',
              props.className,
            )}
          >
            {props.children(close)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

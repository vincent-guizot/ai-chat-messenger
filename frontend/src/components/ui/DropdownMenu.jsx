import { cn } from '../../lib/cn';
import Popover from './Popover';

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
  return (
    <Popover trigger={props.trigger} align={props.align} placement={props.placement} className="min-w-44 p-1">
      {(close) => (
        <div role="menu">
          {props.items.map((item) => {
            const Icon = item.icon;

            function handleSelect() {
              close();
              item.onSelect();
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={handleSelect}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  item.danger && 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
                  !item.danger && 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-navy-800',
                )}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

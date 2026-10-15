import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { getHandle } from '../../utils/formatters';
import { cn } from '../../lib/cn';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import IconButton from '../ui/IconButton';

/**
 * Baris "Dark mode" dengan saklar. Saat sidebar diciutkan hanya tampil sebagai tombol ikon.
 */
function ThemeToggle(props) {
  const isDark = props.theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  if (props.isCollapsed) {
    return (
      <IconButton variant="card" size="lg" label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={props.onToggle}>
        <Icon className="h-5 w-5" />
      </IconButton>
    );
  }

  return (
    <div className="flex h-12 items-center gap-3 rounded-md border border-line bg-surface px-3 shadow-sm">
      <Icon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
      <span id="dark-mode-label" className="flex-1 text-[15px] font-medium text-ink">
        Dark mode
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-labelledby="dark-mode-label"
        onClick={props.onToggle}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
          isDark && 'border-brand-600 bg-brand-600',
          !isDark && 'border-line bg-canvas',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-md ring-1 ring-black/5 transition-all',
            isDark && 'left-[26px]',
            !isDark && 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

export default function UserFooter(props) {
  const user = useAuthStore((state) => state.user);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  let userName = 'You';
  let userEmail = '';
  if (user) {
    userName = user.name || 'You';
    userEmail = user.email;
  }

  // Saat sidebar diciutkan, menu dibuka ke kanan agar tidak terpotong.
  let menuAlign = 'right';
  if (props.isCollapsed) {
    menuAlign = 'left';
  }

  const menuItems = [{ label: 'Log out', icon: LogOut, onSelect: props.onLogout, danger: true }];

  return (
    <div className={cn('flex flex-col gap-3', props.isCollapsed && 'items-center')}>
      <ThemeToggle theme={theme} isCollapsed={props.isCollapsed} onToggle={toggleTheme} />

      <div
        className={cn(
          'flex items-center gap-3 rounded-md border border-line bg-surface p-2.5 shadow-sm',
          props.isCollapsed && 'flex-col border-transparent bg-transparent p-0 shadow-none',
        )}
      >
        <Avatar name={userName} size="lg" status="online" />

        {!props.isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-ink">{userName}</div>
            <div className="truncate text-sm text-ink-muted">{getHandle(userEmail)}</div>
          </div>
        )}

        <DropdownMenu
          align={menuAlign}
          placement="top"
          items={menuItems}
          trigger={(isOpen, toggle) => (
            <IconButton variant="ghost" size="md" label="Settings" onClick={toggle} aria-expanded={isOpen}>
              <Settings className="h-5 w-5" />
            </IconButton>
          )}
        />
      </div>
    </div>
  );
}

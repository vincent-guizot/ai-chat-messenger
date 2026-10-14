import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { getHandle } from '../../utils/formatters';
import { cn } from '../../lib/cn';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import IconButton from '../ui/IconButton';

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

  let themeLabel = 'Dark mode';
  let ThemeIcon = Moon;
  if (theme === 'dark') {
    themeLabel = 'Light mode';
    ThemeIcon = Sun;
  }

  // Saat sidebar diciutkan, menu dibuka ke kanan agar tidak terpotong.
  let menuAlign = 'right';
  if (props.isCollapsed) {
    menuAlign = 'left';
  }

  const menuItems = [
    { label: themeLabel, icon: ThemeIcon, onSelect: toggleTheme },
    { label: 'Log out', icon: LogOut, onSelect: props.onLogout, danger: true },
  ];

  return (
    <div className={cn('flex items-center gap-2.5 border-t border-navy-800 px-1 pt-3', props.isCollapsed && 'flex-col')}>
      <Avatar name={userName} size="md" status="online" statusRingClassName="ring-navy-900" />

      {!props.isCollapsed && (
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{userName}</div>
          <div className="truncate text-xs text-slate-400">{getHandle(userEmail)}</div>
        </div>
      )}

      <DropdownMenu
        align={menuAlign}
        placement="top"
        items={menuItems}
        trigger={(isOpen, toggle) => (
          <IconButton variant="sidebar" size="sm" label="Settings" onClick={toggle} aria-expanded={isOpen}>
            <Settings className="h-4 w-4" />
          </IconButton>
        )}
      />
    </div>
  );
}

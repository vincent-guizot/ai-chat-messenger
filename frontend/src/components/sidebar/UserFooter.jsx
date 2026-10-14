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
    <div className={cn('flex items-center gap-3 border-t border-white/10 pt-4', props.isCollapsed && 'flex-col')}>
      <Avatar name={userName} size="md" status="online" statusRingClassName="ring-navy-800" />

      {!props.isCollapsed && (
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-white">{userName}</div>
          <div className="truncate text-sm text-slate-300/80">{getHandle(userEmail)}</div>
        </div>
      )}

      <DropdownMenu
        align={menuAlign}
        placement="top"
        items={menuItems}
        trigger={(isOpen, toggle) => (
          <IconButton variant="sidebar" label="Settings" onClick={toggle} aria-expanded={isOpen}>
            <Settings className="h-5 w-5" />
          </IconButton>
        )}
      />
    </div>
  );
}

import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getHandle } from '../../utils/formatters';
import { cn } from '../../lib/cn';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import IconButton from '../ui/IconButton';

export default function UserFooter(props) {
  const user = useAuthStore((state) => state.user);

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
    <div className={cn('flex flex-col', props.isCollapsed && 'items-center')}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border border-line bg-canvas p-2',
          props.isCollapsed && 'flex-col border-transparent bg-transparent p-0 shadow-none',
        )}
      >
        <Avatar name={userName} size="md" status="online" />

        {!props.isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-ink">{userName}</div>
            <div className="truncate text-sm text-ink-muted">{getHandle(userEmail)}</div>
          </div>
        )}

        <DropdownMenu
          align={menuAlign}
          placement="top"
          items={menuItems}
          trigger={(isOpen, toggle) => (
            <IconButton variant="ghost" size="sm" label="Settings" onClick={toggle} aria-expanded={isOpen}>
              <Settings className="h-[18px] w-[18px]" />
            </IconButton>
          )}
        />
      </div>
    </div>
  );
}

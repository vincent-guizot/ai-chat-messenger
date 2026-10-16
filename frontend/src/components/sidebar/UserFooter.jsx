import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getHandle } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/shared/UserAvatar';
import IconButton from '@/components/shared/IconButton';

/**
 * Kartu user di bagian bawah sidebar: avatar, nama, handle, dan menu pengaturan (log out).
 */
export default function UserFooter(props) {
  const user = useAuthStore((state) => state.user);

  let userName = 'You';
  let userEmail = '';
  if (user) {
    userName = user.name || 'You';
    userEmail = user.email;
  }

  // Saat sidebar diciutkan, menu dibuka ke kanan agar tidak terpotong.
  let menuSide = 'top';
  if (props.isCollapsed) {
    menuSide = 'right';
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-background p-2',
        props.isCollapsed && 'flex-col border-transparent bg-transparent p-0',
      )}
    >
      <UserAvatar name={userName} size="md" status="online" />

      {!props.isCollapsed && (
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-foreground">{userName}</div>
          <div className="truncate text-sm text-muted-foreground">{getHandle(userEmail)}</div>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Settings" size="icon-sm">
            <Settings className="size-[18px]" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={menuSide} align="end">
          <DropdownMenuLabel className="truncate">{userEmail}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={props.onLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

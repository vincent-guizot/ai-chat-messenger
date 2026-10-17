import { EllipsisVertical, LogOut, Menu, Moon, Search, SquarePen, Sun, Trash2, X } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { formatLastSeen } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import useMinuteTick from '@/hooks/useMinuteTick';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/shared/UserAvatar';
import IconButton from '@/components/shared/IconButton';
import NotificationBell from '@/components/notifications/NotificationBell';

/**
 * Teks & warna status di bawah judul, contoh:
 *   AI  -> "Online · Ready to help" / "Thinking..."
 *   DM  -> "Online" / "typing..." / "Last seen 10m ago"
 *
 * Status selalu berupa teks (bukan hanya warna titik), sesuai pedoman aksesibilitas.
 */
function getStatus(props) {
  if (props.isTyping && props.isAssistant) {
    return { text: 'Thinking...', dotClass: 'bg-warning', textClass: 'text-amber-600 dark:text-warning' };
  }

  if (props.isTyping) {
    return { text: 'typing...', dotClass: 'bg-primary', textClass: 'text-primary dark:text-brand-300' };
  }

  if (props.isAssistant) {
    return { text: 'Online · Ready to help', dotClass: 'bg-success', textClass: 'text-success' };
  }

  if (props.otherUser && props.otherUser.online) {
    return { text: 'Online', dotClass: 'bg-success', textClass: 'text-success' };
  }

  if (props.otherUser) {
    return {
      text: formatLastSeen(props.otherUser.lastSeenAt),
      dotClass: 'bg-muted-foreground/60',
      textClass: 'text-muted-foreground',
    };
  }

  return { text: '', dotClass: null, textClass: '' };
}

function MessageSearchField(props) {
  return (
    <div className="relative hidden w-full max-w-64 md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />

      <Input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder="Search messages..."
        aria-label="Search messages"
        className="bg-background pl-9 pr-8"
      />

      {props.value !== '' && (
        <button
          type="button"
          onClick={() => props.onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export default function ChatHeader(props) {
  // Perbarui teks "Last seen ..." setiap menit.
  useMinuteTick();

  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  const status = getStatus(props);

  let ThemeIcon = Moon;
  let themeLabel = 'Switch to dark mode';
  if (theme === 'dark') {
    ThemeIcon = Sun;
    themeLabel = 'Switch to light mode';
  }

  let otherUserName;
  if (props.otherUser) {
    otherUserName = props.otherUser.name;
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <IconButton label="Open menu" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="size-[18px]" />
      </IconButton>

      {props.hasConversation && (
        <>
          <button
            type="button"
            onClick={props.onOpenProfile}
            disabled={!props.onOpenProfile}
            title={props.onOpenProfile ? 'View profile' : undefined}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left enabled:hover:opacity-80"
          >
            <UserAvatar isAssistant={props.isAssistant} name={otherUserName} size="md" />

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold leading-tight text-foreground">{props.title}</h1>
              <p className={cn('flex items-center gap-1.5 text-xs', status.textClass)}>
                {status.dotClass && <span className={cn('size-2 shrink-0 rounded-full', status.dotClass)} aria-hidden="true" />}
                <span className="truncate">{status.text}</span>
              </p>
            </div>
          </button>

          <MessageSearchField value={props.searchText} onChange={props.onSearchChange} />
        </>
      )}

      {!props.hasConversation && <div className="flex-1" />}

      <NotificationBell />

      <IconButton label={themeLabel} variant="outline" onClick={toggleTheme}>
        <ThemeIcon className="size-[18px]" />
      </IconButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="More options" variant="outline">
            <EllipsisVertical className="size-[18px]" />
          </IconButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={props.onNewChat}>
            <SquarePen />
            New AI chat
          </DropdownMenuItem>

          {props.hasConversation && (
            <DropdownMenuItem variant="destructive" onSelect={props.onDeleteChat}>
              <Trash2 />
              Delete chat
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" onSelect={props.onLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

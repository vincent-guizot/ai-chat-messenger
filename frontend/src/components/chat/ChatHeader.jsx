import { EllipsisVertical, LogOut, Menu, Moon, Search, SquarePen, Sun, Trash2, X } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { formatLastSeen } from '../../utils/formatters';
import { cn } from '../../lib/cn';
import useMinuteTick from '../../hooks/useMinuteTick';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import IconButton from '../ui/IconButton';
import NotificationBell from '../notifications/NotificationBell';

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
    return { text: 'typing...', dotClass: 'bg-brand-600', textClass: 'text-brand-600 dark:text-brand-300' };
  }

  if (props.isAssistant) {
    return { text: 'Online · Ready to help', dotClass: 'bg-success', textClass: 'text-success' };
  }

  if (props.otherUser && props.otherUser.online) {
    return { text: 'Online', dotClass: 'bg-success', textClass: 'text-success' };
  }

  if (props.otherUser) {
    return { text: formatLastSeen(props.otherUser.lastSeenAt), dotClass: 'bg-ink-muted/60', textClass: 'text-ink-muted' };
  }

  return { text: '', dotClass: null, textClass: '' };
}

function MessageSearchField(props) {
  return (
    <label className="hidden h-10 w-full max-w-64 items-center gap-2 rounded-md border border-line bg-canvas px-3 transition-colors focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15 md:flex">
      <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder="Search messages..."
        aria-label="Search messages"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
      />
      {props.value !== '' && (
        <button
          type="button"
          onClick={() => props.onChange('')}
          className="rounded-sm p-0.5 text-ink-muted hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
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

  const menuItems = [{ label: 'New AI chat', icon: SquarePen, onSelect: props.onNewChat }];

  if (props.hasConversation) {
    menuItems.push({ label: 'Delete chat', icon: Trash2, onSelect: props.onDeleteChat, danger: true });
  }

  menuItems.push({ label: 'Log out', icon: LogOut, onSelect: props.onLogout, danger: true });

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <IconButton variant="ghost" size="md" label="Open menu" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="h-[18px] w-[18px]" />
      </IconButton>

      {props.hasConversation && (
        <>
          <Avatar isAssistant={props.isAssistant} name={otherUserName} size="md" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold leading-tight text-ink">{props.title}</h1>
            <p className={cn('flex items-center gap-1.5 text-xs', status.textClass)}>
              {status.dotClass && <span className={cn('h-2 w-2 shrink-0 rounded-full', status.dotClass)} aria-hidden="true" />}
              <span className="truncate">{status.text}</span>
            </p>
          </div>

          <MessageSearchField value={props.searchText} onChange={props.onSearchChange} />
        </>
      )}

      {!props.hasConversation && <div className="flex-1" />}

      <NotificationBell />

      <IconButton variant="card" size="md" label={themeLabel} onClick={toggleTheme}>
        <ThemeIcon className="h-[18px] w-[18px]" />
      </IconButton>

      <DropdownMenu
        items={menuItems}
        trigger={(isOpen, toggle) => (
          <IconButton variant="card" size="md" label="More options" onClick={toggle} aria-expanded={isOpen}>
            <EllipsisVertical className="h-[18px] w-[18px]" />
          </IconButton>
        )}
      />
    </header>
  );
}

import { EllipsisVertical, LogOut, Menu, Moon, Search, SquarePen, Sun, X } from 'lucide-react';
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
 * dotClass: warna titik status (hijau = online, biru = sedang mengetik, abu-abu = offline)
 */
function getStatus(props) {
  if (props.isTyping && props.isAssistant) {
    return { text: 'Thinking...', dotClass: 'bg-brand-500' };
  }

  if (props.isTyping) {
    return { text: 'typing...', dotClass: 'bg-brand-500' };
  }

  if (props.isAssistant) {
    return { text: 'Online · Ready to help', dotClass: 'bg-success' };
  }

  if (props.otherUser && props.otherUser.online) {
    return { text: 'Online', dotClass: 'bg-success' };
  }

  if (props.otherUser) {
    return { text: formatLastSeen(props.otherUser.lastSeenAt), dotClass: 'bg-slate-400' };
  }

  return { text: '', dotClass: null };
}

function MessageSearchField(props) {
  return (
    <label className="hidden h-9 w-full max-w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/15 md:flex dark:border-navy-700 dark:bg-navy-900">
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder="Search messages..."
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
      />
      {props.value !== '' && (
        <button
          type="button"
          onClick={() => props.onChange('')}
          className="rounded p-0.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
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

  const menuItems = [
    { label: 'New AI chat', icon: SquarePen, onSelect: props.onNewChat },
    { label: 'Log out', icon: LogOut, onSelect: props.onLogout, danger: true },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200 bg-white px-3 sm:px-5 dark:border-navy-800 dark:bg-navy-950">
      <IconButton variant="ghost" size="md" label="Open menu" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="h-[18px] w-[18px]" />
      </IconButton>

      {props.hasConversation && (
        <>
          <Avatar isAssistant={props.isAssistant} name={otherUserName} size="lg" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">{props.title}</h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {status.dotClass && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dotClass)} aria-hidden="true" />}
              <span className="truncate">{status.text}</span>
            </p>
          </div>

          <MessageSearchField value={props.searchText} onChange={props.onSearchChange} />
        </>
      )}

      {!props.hasConversation && <div className="flex-1" />}

      <NotificationBell />

      <IconButton variant="card" size="lg" label={themeLabel} onClick={toggleTheme} className="hidden sm:inline-flex">
        <ThemeIcon className="h-[18px] w-[18px]" />
      </IconButton>

      <DropdownMenu
        items={menuItems}
        trigger={(isOpen, toggle) => (
          <IconButton variant="card" size="lg" label="More options" onClick={toggle} aria-expanded={isOpen}>
            <EllipsisVertical className="h-[18px] w-[18px]" />
          </IconButton>
        )}
      />
    </header>
  );
}

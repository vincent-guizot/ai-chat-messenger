import { EllipsisVertical, LogOut, Menu, Moon, Search, SquarePen, Sun, X } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { formatLastSeen } from '../../utils/formatters';
import useMinuteTick from '../../hooks/useMinuteTick';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import IconButton from '../ui/IconButton';

/**
 * Teks status di bawah judul, contoh:
 *   AI  -> "Online · Ready to help" / "Thinking..."
 *   DM  -> "Online" / "typing..." / "Last seen 10m ago"
 */
function getStatus(props) {
  if (props.isAssistant) {
    if (props.isTyping) {
      return { text: 'Thinking...', isOnline: true };
    }

    return { text: 'Online · Ready to help', isOnline: true };
  }

  if (props.isTyping) {
    return { text: 'typing...', isOnline: true };
  }

  if (props.otherUser && props.otherUser.online) {
    return { text: 'Online', isOnline: true };
  }

  if (props.otherUser) {
    return { text: formatLastSeen(props.otherUser.lastSeenAt), isOnline: false };
  }

  return { text: '', isOnline: false };
}

function MessageSearchField(props) {
  return (
    <label className="hidden h-12 w-full max-w-80 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 shadow-sm transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10 md:flex dark:border-white/10 dark:bg-white/5">
      <Search className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder="Search messages..."
        className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
      />
      {props.value !== '' && (
        <button
          type="button"
          onClick={() => props.onChange('')}
          className="rounded-full p-0.5 text-slate-400 hover:text-slate-600"
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

  const menuItems = [
    { label: 'New AI chat', icon: SquarePen, onSelect: props.onNewChat },
    { label: 'Log out', icon: LogOut, onSelect: props.onLogout, danger: true },
  ];

  return (
    <header className="flex items-center gap-3 border-b border-slate-200/70 px-4 py-4 sm:gap-4 sm:px-6 dark:border-white/10">
      <IconButton variant="card" size="md" label="Open menu" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="h-5 w-5" />
      </IconButton>

      {props.hasConversation && (
        <>
          <Avatar isAssistant={props.isAssistant} name={otherUserName} size="lg" className="hidden sm:flex" />
          <Avatar isAssistant={props.isAssistant} name={otherUserName} size="md" className="sm:hidden" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-white">{props.title}</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500 sm:text-[15px] dark:text-slate-400">
              {status.isOnline && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />}
              <span className="truncate">{status.text}</span>
            </p>
          </div>

          <MessageSearchField value={props.searchText} onChange={props.onSearchChange} />
        </>
      )}

      {!props.hasConversation && <div className="flex-1" />}

      <IconButton variant="card" size="lg" label={themeLabel} onClick={toggleTheme}>
        <ThemeIcon className="h-5 w-5" />
      </IconButton>

      <DropdownMenu
        items={menuItems}
        trigger={(isOpen, toggle) => (
          <IconButton variant="card" size="lg" label="More options" onClick={toggle} aria-expanded={isOpen}>
            <EllipsisVertical className="h-5 w-5" />
          </IconButton>
        )}
      />
    </header>
  );
}

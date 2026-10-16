import { Bot, UserRound, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SIDEBAR_TABS } from '@/stores/uiStore';

const NAV_ITEMS = [
  { tab: SIDEBAR_TABS.assistant, label: 'AI Assistant', icon: Bot },
  { tab: SIDEBAR_TABS.direct, label: 'Direct Messages', icon: UserRound },
  { tab: SIDEBAR_TABS.contacts, label: 'Contacts', icon: UsersRound },
];

/**
 * Angka kecil di kanan menu: jumlah pesan belum dibaca (merah) atau user online (hijau).
 */
function NavCounter(props) {
  if (props.count <= 0) {
    return null;
  }

  return (
    <Badge variant={props.variant} className="ml-auto h-5 min-w-5 px-1.5" aria-label={props.label}>
      {props.count}
    </Badge>
  );
}

export default function SidebarNav(props) {
  return (
    <nav className="space-y-1" aria-label="Sidebar">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = props.activeTab === item.tab;

        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => props.onChange(item.tab)}
            title={item.label}
            aria-pressed={isActive}
            className={cn(
              'flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-base font-medium transition-colors',
              isActive && 'bg-accent text-brand-700 dark:text-brand-300',
              !isActive && 'text-foreground hover:bg-muted',
              props.isCollapsed && 'justify-center px-0',
            )}
          >
            <Icon className={cn('size-[18px] shrink-0', isActive && 'text-primary dark:text-brand-300')} aria-hidden="true" />
            {!props.isCollapsed && <span className="truncate">{item.label}</span>}

            {!props.isCollapsed && item.tab === SIDEBAR_TABS.direct && (
              <NavCounter count={props.unreadDirectCount} variant="destructive" label={`${props.unreadDirectCount} unread`} />
            )}

            {!props.isCollapsed && item.tab === SIDEBAR_TABS.contacts && (
              <NavCounter count={props.onlineCount} variant="success" label={`${props.onlineCount} online`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

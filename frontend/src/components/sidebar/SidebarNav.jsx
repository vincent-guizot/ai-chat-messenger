import { Bot, UserRound, UsersRound } from 'lucide-react';
import { cn } from '../../lib/cn';
import { SIDEBAR_TABS } from '../../stores/uiStore';

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
    <span
      className={cn(
        'ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none',
        props.tone === 'danger' && 'bg-danger text-white',
        props.tone === 'success' && 'bg-success/15 text-green-400',
      )}
    >
      {props.count}
    </span>
  );
}

export default function SidebarNav(props) {
  return (
    <nav className="space-y-0.5" aria-label="Sidebar">
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
              'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors',
              isActive && 'bg-navy-700 text-white',
              !isActive && 'text-slate-300 hover:bg-navy-800 hover:text-white',
              props.isCollapsed && 'justify-center px-0',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!props.isCollapsed && <span className="truncate">{item.label}</span>}

            {!props.isCollapsed && item.tab === SIDEBAR_TABS.direct && (
              <NavCounter count={props.unreadDirectCount} tone="danger" />
            )}

            {!props.isCollapsed && item.tab === SIDEBAR_TABS.contacts && (
              <NavCounter count={props.onlineCount} tone="success" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

import { Bot, UserRound, UsersRound } from 'lucide-react';
import { cn } from '../../lib/cn';
import { SIDEBAR_TABS } from '../../stores/uiStore';

const NAV_ITEMS = [
  { tab: SIDEBAR_TABS.assistant, label: 'AI Assistant', icon: Bot },
  { tab: SIDEBAR_TABS.direct, label: 'Direct Messages', icon: UserRound },
  { tab: SIDEBAR_TABS.contacts, label: 'Contacts', icon: UsersRound },
];

export default function SidebarNav(props) {
  return (
    <nav className="space-y-1.5" aria-label="Sidebar">
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
              'flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition',
              isActive && 'border-white/10 bg-white/10 text-white shadow-inner',
              !isActive && 'border-transparent text-slate-200 hover:bg-white/5 hover:text-white',
              props.isCollapsed && 'justify-center px-0',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!props.isCollapsed && <span className="truncate">{item.label}</span>}

            {!props.isCollapsed && item.tab === SIDEBAR_TABS.contacts && props.onlineCount > 0 && (
              <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                {props.onlineCount} online
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

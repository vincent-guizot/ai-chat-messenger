import { Bell, BellOff, CheckCheck, Info, MessageSquareText } from 'lucide-react';
import { cn } from '../../lib/cn';
import { SIDEBAR_TABS, useUiStore } from '../../stores/uiStore';
import { useOpenConversation } from '../../hooks/useChatData';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatters';
import IconButton from '../ui/IconButton';
import Popover from '../ui/Popover';

const MAX_BADGE_COUNT = 9;

// Ikon & warna aksen per jenis notifikasi.
const TYPE_STYLES = {
  message: {
    icon: MessageSquareText,
    iconClass: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  },
  system: {
    icon: Info,
    iconClass: 'bg-sky-50 text-info dark:bg-sky-500/15 dark:text-sky-300',
  },
};

function UnreadBadge(props) {
  if (props.count === 0) {
    return null;
  }

  let label = String(props.count);
  if (props.count > MAX_BADGE_COUNT) {
    label = `${MAX_BADGE_COUNT}+`;
  }

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-navy-950">
      {label}
    </span>
  );
}

function NotificationItem(props) {
  const notification = props.notification;
  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.system;
  const Icon = style.icon;
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      onClick={() => props.onSelect(notification)}
      className={cn(
        'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-navy-800',
        isUnread && 'bg-brand-50/50 dark:bg-brand-500/5',
      )}
    >
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', style.iconClass)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-sm', isUnread && 'font-semibold text-slate-900 dark:text-white')}>
          {notification.title}
        </span>
        {notification.body && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">{notification.body}</span>
        )}
        <span className="mt-1 block text-[11px] text-slate-400">{formatRelativeTime(notification.createdAt)}</span>
      </span>

      {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
    </button>
  );
}

/**
 * Tombol lonceng di header + panel daftar notifikasi.
 */
export default function NotificationBell() {
  const notificationsQuery = useNotificationsQuery();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  const notifications = notificationsQuery.result.notifications;
  const unreadCount = notificationsQuery.result.unreadCount;

  function handleSelect(notification, close) {
    if (!notification.readAt) {
      markNotificationRead.mutate(notification.id);
    }

    if (notification.conversationId) {
      setActiveTab(SIDEBAR_TABS.direct);
      openConversation(notification.conversationId);
    }

    close();
  }

  return (
    <Popover
      className="w-[min(22rem,calc(100vw-2rem))]"
      trigger={(isOpen, toggle) => (
        <IconButton variant="card" size="lg" label="Notifications" onClick={toggle} aria-expanded={isOpen}>
          <Bell className="h-[18px] w-[18px]" />
          <UnreadBadge count={unreadCount} />
        </IconButton>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-navy-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => markAllNotificationsRead.mutate(null)}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:cursor-default disabled:text-slate-400 dark:text-brand-300"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-navy-800">
            {notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-slate-400">
                <BellOff className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm">You're all caught up</span>
              </div>
            )}

            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={(selected) => handleSelect(selected, close)}
              />
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}

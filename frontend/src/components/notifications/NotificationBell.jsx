import { useState } from 'react';
import { Bell, BellOff, CheckCheck, Info, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIDEBAR_TABS, useUiStore } from '@/stores/uiStore';
import { useOpenConversation } from '@/hooks/useChatData';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsQuery } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import IconButton from '@/components/shared/IconButton';

const MAX_BADGE_COUNT = 9;

// Ikon & warna aksen per jenis notifikasi.
const TYPE_STYLES = {
  message: {
    icon: MessageSquareText,
    iconClass: 'bg-brand-50 text-primary dark:bg-brand-500/15 dark:text-brand-300',
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
    <Badge variant="destructive" className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px] ring-2 ring-card">
      {label}
    </Badge>
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
        'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted',
        isUnread && 'bg-brand-50/50 dark:bg-brand-500/5',
      )}
    >
      <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md', style.iconClass)}>
        <Icon className="size-3.5" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-sm', isUnread && 'font-semibold text-foreground')}>{notification.title}</span>
        {notification.body && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{notification.body}</span>}
        <span className="mt-1 block text-[11px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
      </span>

      {isUnread && <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
    </button>
  );
}

/**
 * Tombol lonceng di header + panel daftar notifikasi (Popover shadcn/ui).
 */
export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useNotificationsQuery();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const openConversation = useOpenConversation();
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  const notifications = notificationsQuery.result.notifications;
  const unreadCount = notificationsQuery.result.unreadCount;

  function handleSelect(notification) {
    if (!notification.readAt) {
      markNotificationRead.mutate(notification.id);
    }

    if (notification.conversationId) {
      setActiveTab(SIDEBAR_TABS.direct);
      openConversation(notification.conversationId);
    }

    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <IconButton label="Notifications" variant="outline" aria-expanded={isOpen}>
          <Bell className="size-[18px]" />
          <UnreadBadge count={unreadCount} />
        </IconButton>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => markAllNotificationsRead.mutate(null)}
            disabled={unreadCount === 0}
            className="h-8 gap-1 px-1 text-xs disabled:text-muted-foreground"
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            Mark all as read
          </Button>
        </div>

        <ScrollArea className="max-h-96" viewportClassName="max-h-96 [&>div]:divide-y [&>div]:divide-border">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-muted-foreground">
              <BellOff className="size-5" aria-hidden="true" />
              <span className="text-sm">You're all caught up</span>
            </div>
          )}

          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onSelect={handleSelect} />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

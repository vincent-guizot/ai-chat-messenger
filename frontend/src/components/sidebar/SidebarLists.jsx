import { useAuthStore } from '@/stores/authStore';
import { toTypingInfo, useChatStore } from '@/stores/chatStore';
import { VIEWS, useUiStore } from '@/stores/uiStore';
import { BellOff } from 'lucide-react';
import { GROUPS } from '@/data/groups';
import GroupAvatar from '@/components/groups/GroupAvatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar, { toPresenceStatus } from '@/components/shared/UserAvatar';
import SidebarListItem from './SidebarListItem';
import { formatLastSeen, formatTime, truncate } from '@/utils/formatters';
import { findOtherUser, getConversationTitle, getLastMessage } from '@/utils/conversations';

const MAX_BADGE_COUNT = 9;

function EmptyListMessage(props) {
  return <p className="px-3 py-6 text-center text-sm leading-relaxed text-muted-foreground">{props.children}</p>;
}

function LoadingRows() {
  return (
    <div className="space-y-1" aria-label="Loading">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Badge merah berisi jumlah pesan belum dibaca.
 */
function UnreadBadge(props) {
  let label = String(props.count);
  if (props.count > MAX_BADGE_COUNT) {
    label = `${MAX_BADGE_COUNT}+`;
  }

  return (
    <Badge variant="destructive" className="h-5 min-w-5 px-1">
      {label}
    </Badge>
  );
}

/**
 * Teks status online untuk satu user, contoh: "Online" atau "Last seen 10m ago".
 */
function getPresenceText(user) {
  if (user && user.online) {
    return 'Online';
  }

  if (user) {
    return formatLastSeen(user.lastSeenAt);
  }

  return '';
}

function getPresenceClassName(user) {
  if (user && user.online) {
    return 'font-medium text-success';
  }

  return undefined;
}

// --- Tab "AI Assistant" ------------------------------------------------------

function AssistantConversationItem(props) {
  const conversation = props.conversation;
  const lastMessage = getLastMessage(conversation);
  const typing = useChatStore((state) => state.typingByConversation[conversation.id]);
  const typingInfo = toTypingInfo(typing);

  let subtitle = 'Ready to help';
  let subtitleClassName;

  if (typingInfo.assistant) {
    subtitle = 'Thinking...';
    subtitleClassName = 'font-medium text-amber-600 dark:text-warning';
  } else if (lastMessage) {
    subtitle = truncate(lastMessage.content, 40);
  }

  let time;
  if (lastMessage) {
    time = formatTime(lastMessage.createdAt);
  }

  return (
    <SidebarListItem
      avatar={<UserAvatar isAssistant size="md" />}
      title={getConversationTitle(conversation, null)}
      time={time}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      isActive={props.isActive}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onOpen(conversation.id)}
      onDelete={() => props.onDelete({ id: conversation.id, title: getConversationTitle(conversation, null) })}
    />
  );
}

export function AssistantConversationList(props) {
  if (props.isLoading) {
    return <LoadingRows />;
  }

  if (props.conversations.length === 0) {
    return <EmptyListMessage>No AI chats yet. Click “New Chat” to start one.</EmptyListMessage>;
  }

  return props.conversations.map((conversation) => (
    <AssistantConversationItem
      key={conversation.id}
      conversation={conversation}
      isActive={conversation.id === props.activeConversationId}
      isCollapsed={props.isCollapsed}
      onOpen={props.onOpen}
      onDelete={props.onDelete}
    />
  ));
}

// --- Tab "Direct Messages" ---------------------------------------------------

function DirectConversationItem(props) {
  const conversation = props.conversation;
  const currentUser = useAuthStore((state) => state.user);
  const typing = useChatStore((state) => state.typingByConversation[conversation.id]);
  const typingInfo = toTypingInfo(typing);

  let currentUserId = null;
  if (currentUser) {
    currentUserId = currentUser.id;
  }

  const otherUser = findOtherUser(conversation, currentUserId, props.contactsById);
  const isOnline = Boolean(otherUser && otherUser.online);

  let subtitle = getPresenceText(otherUser);
  let subtitleClassName = getPresenceClassName(otherUser);

  if (typingInfo.userIds.length > 0) {
    subtitle = 'typing...';
    subtitleClassName = 'font-medium text-brand-600 dark:text-brand-300';
  }

  let otherUserName;
  if (otherUser) {
    otherUserName = otherUser.name;
  }

  const lastMessage = getLastMessage(conversation);

  let time;
  let preview;
  if (lastMessage) {
    time = formatTime(lastMessage.createdAt);
    preview = truncate(lastMessage.content, 32);
  }

  // Ada pesan belum dibaca -> badge merah di kanan bawah.
  let badge = null;
  if (props.unreadCount > 0) {
    badge = <UnreadBadge count={props.unreadCount} />;
  }

  return (
    <SidebarListItem
      avatar={<UserAvatar name={otherUserName} size="md" status={toPresenceStatus(isOnline)} />}
      title={getConversationTitle(conversation, otherUser)}
      time={time}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      preview={preview}
      badge={badge}
      isActive={props.isActive}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onOpen(conversation.id)}
      onDelete={() => props.onDelete({ id: conversation.id, title: getConversationTitle(conversation, otherUser) })}
    />
  );
}

export function DirectConversationList(props) {
  if (props.isLoading) {
    return <LoadingRows />;
  }

  if (props.conversations.length === 0) {
    return <EmptyListMessage>No direct messages yet. Open “Contacts” to chat with someone.</EmptyListMessage>;
  }

  return props.conversations.map((conversation) => (
    <DirectConversationItem
      key={conversation.id}
      conversation={conversation}
      contactsById={props.contactsById}
      unreadCount={props.unreadByConversation[conversation.id] || 0}
      isActive={conversation.id === props.activeConversationId}
      isCollapsed={props.isCollapsed}
      onOpen={props.onOpen}
      onDelete={props.onDelete}
    />
  ));
}

// --- Tab "Contacts" ----------------------------------------------------------

export function ContactList(props) {
  if (props.isLoading) {
    return <LoadingRows />;
  }

  if (props.contacts.length === 0) {
    return <EmptyListMessage>No other users yet. Ask a friend to sign up!</EmptyListMessage>;
  }

  return props.contacts.map((contact) => (
    <SidebarListItem
      key={contact.id}
      avatar={<UserAvatar name={contact.name} size="md" status={toPresenceStatus(contact.online)} />}
      title={contact.name}
      subtitle={getPresenceText(contact)}
      subtitleClassName={getPresenceClassName(contact)}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onStartChat(contact.id)}
      onInfo={() => props.onOpenProfile(contact.id)}
    />
  ));
}

// --- Tab "Group Chats" --------------------------------------------------------

export function GroupList(props) {
  const view = useUiStore((state) => state.view);
  const openView = useUiStore((state) => state.openView);

  return GROUPS.map((group) => {
    const lastMessage = group.messages[group.messages.length - 1];

    let badge = null;
    if (group.muted) {
      badge = <BellOff className="size-3.5 text-muted-foreground" aria-label="Muted" />;
    } else if (group.unread > 0) {
      badge = <UnreadBadge count={group.unread} />;
    }

    let preview;
    let time;
    if (lastMessage) {
      preview = truncate(lastMessage.content, 32);
      time = formatTime(lastMessage.createdAt);
    }

    const isActive = view.id === group.id && view.name !== VIEWS.memberDetails;

    return (
      <SidebarListItem
        key={group.id}
        avatar={<GroupAvatar name={group.name} size="md" />}
        title={group.name}
        time={time}
        subtitle={`${group.members.length} members`}
        preview={preview}
        badge={badge}
        isActive={isActive}
        isCollapsed={props.isCollapsed}
        onClick={() => openView(VIEWS.groupChat, group.id)}
      />
    );
  });
}

import { useAuthStore } from '../../stores/authStore';
import { toTypingInfo, useChatStore } from '../../stores/chatStore';
import Avatar, { toPresenceStatus } from '../ui/Avatar';
import SidebarListItem from './SidebarListItem';
import { formatLastSeen, formatTime, truncate } from '../../utils/formatters';
import { findOtherUser, getConversationTitle, getLastMessage } from '../../utils/conversations';

const MAX_BADGE_COUNT = 9;

function EmptyListMessage(props) {
  return <p className="px-3 py-6 text-center text-sm leading-relaxed text-ink-muted">{props.children}</p>;
}

function LoadingRows() {
  return (
    <div className="space-y-1" aria-label="Loading">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-3 px-3 py-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-line" />
            <div className="h-3 w-32 animate-pulse rounded bg-line/60" />
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
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
      {label}
    </span>
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
    subtitleClassName = 'font-medium text-ai-600 dark:text-ai-300';
  } else if (lastMessage) {
    subtitle = truncate(lastMessage.content, 40);
  }

  let time;
  if (lastMessage) {
    time = formatTime(lastMessage.createdAt);
  }

  return (
    <SidebarListItem
      avatar={<Avatar isAssistant size="lg" />}
      title={getConversationTitle(conversation, null)}
      time={time}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      isActive={props.isActive}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onOpen(conversation.id)}
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
      avatar={<Avatar name={otherUserName} size="lg" status={toPresenceStatus(isOnline)} />}
      title={getConversationTitle(conversation, otherUser)}
      time={time}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      preview={preview}
      badge={badge}
      isActive={props.isActive}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onOpen(conversation.id)}
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
      avatar={<Avatar name={contact.name} size="lg" status={toPresenceStatus(contact.online)} />}
      title={contact.name}
      subtitle={getPresenceText(contact)}
      subtitleClassName={getPresenceClassName(contact)}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onStartChat(contact.id)}
    />
  ));
}

import { useAuthStore } from '../../stores/authStore';
import { toTypingInfo, useChatStore } from '../../stores/chatStore';
import Avatar, { toPresenceStatus } from '../ui/Avatar';
import SidebarListItem from './SidebarListItem';
import StatusDot from './StatusDot';
import { formatLastSeen, formatTime, truncate } from '../../utils/formatters';
import { findOtherUser, getConversationTitle, getLastMessage } from '../../utils/conversations';

const MAX_BADGE_COUNT = 9;

function EmptyListMessage(props) {
  return <p className="px-3 py-6 text-center text-xs leading-relaxed text-slate-400">{props.children}</p>;
}

function LoadingRows() {
  return (
    <div className="space-y-1" aria-label="Loading">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="h-9 w-9 animate-pulse rounded-full bg-navy-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-20 animate-pulse rounded bg-navy-800" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-navy-800/60" />
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
    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
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
    return 'text-green-400';
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
    subtitleClassName = 'text-brand-300';
  } else if (lastMessage) {
    subtitle = truncate(lastMessage.content, 40);
  }

  let trailing = null;
  if (lastMessage) {
    trailing = <span className="shrink-0 self-start pt-0.5 text-[11px] text-slate-500">{formatTime(lastMessage.createdAt)}</span>;
  }

  return (
    <SidebarListItem
      avatar={<Avatar isAssistant size="md" />}
      title={getConversationTitle(conversation, null)}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      trailing={trailing}
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
    subtitleClassName = 'text-brand-300';
  }

  let otherUserName;
  if (otherUser) {
    otherUserName = otherUser.name;
  }

  // Ada pesan belum dibaca -> badge merah, jika tidak -> titik status online.
  let trailing = <StatusDot isOnline={isOnline} />;
  if (props.unreadCount > 0) {
    trailing = <UnreadBadge count={props.unreadCount} />;
  }

  return (
    <SidebarListItem
      avatar={
        <Avatar name={otherUserName} size="md" status={toPresenceStatus(isOnline)} statusRingClassName="ring-navy-900" />
      }
      title={getConversationTitle(conversation, otherUser)}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
      trailing={trailing}
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
      avatar={
        <Avatar
          name={contact.name}
          size="md"
          status={toPresenceStatus(contact.online)}
          statusRingClassName="ring-navy-900"
        />
      }
      title={contact.name}
      subtitle={getPresenceText(contact)}
      subtitleClassName={getPresenceClassName(contact)}
      trailing={<StatusDot isOnline={contact.online} />}
      isCollapsed={props.isCollapsed}
      onClick={() => props.onStartChat(contact.id)}
    />
  ));
}

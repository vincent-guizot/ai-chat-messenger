import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { BellOff, Info, Pin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { VIEWS, useUiStore } from '@/stores/uiStore';
import { useContactsById } from '@/hooks/useChatData';
import { findGroup, resolvePerson } from '@/data/groups';
import { formatDayLabel, formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/PageHeader';
import IconButton from '@/components/shared/IconButton';
import AvatarStack from '@/components/shared/AvatarStack';
import UserAvatar from '@/components/shared/UserAvatar';
import MessageInput from '@/components/chat/MessageInput';
import MessageContent from '@/components/chat/MessageContent';
import GroupAvatar from './GroupAvatar';

const SENDER_TEXT_COLORS = [
  'text-brand-600 dark:text-brand-300',
  'text-emerald-600 dark:text-emerald-400',
  'text-rose-600 dark:text-rose-400',
  'text-amber-600 dark:text-amber-400',
  'text-sky-600 dark:text-sky-400',
];

function senderColor(personId) {
  let total = 0;
  for (const character of personId) {
    total = total + character.charCodeAt(0);
  }

  return SENDER_TEXT_COLORS[total % SENDER_TEXT_COLORS.length];
}

function isSameDay(first, second) {
  if (!first || !second) {
    return false;
  }

  return new Date(first.createdAt).toDateString() === new Date(second.createdAt).toDateString();
}

function DateSeparator(props) {
  return (
    <div className="flex items-center gap-4 py-0.5" role="separator" aria-label={props.label}>
      <span className="h-px flex-1 bg-border" />
      <span className="rounded-full border border-border bg-card px-3 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
        {props.label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Satu pesan grup. Pesan orang lain menampilkan nama pengirim di atas gelembung
 * (hanya pada pesan pertama dari satu rangkaian pesan yang sama).
 */
function GroupMessage(props) {
  const message = props.message;
  const sender = props.sender;

  return (
    <div className={cn('flex items-start gap-2.5', props.isOwn && 'flex-row-reverse', !props.showHeader && '-mt-2')}>
      <div className="w-8 shrink-0">
        {props.showHeader && !props.isOwn && <UserAvatar name={sender.name} size="sm" />}
      </div>

      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[72%]', props.isOwn && 'items-end')}>
        {props.showHeader && !props.isOwn && (
          <button
            type="button"
            onClick={() => props.onOpenMember(sender.id)}
            className={cn('mb-1 self-start px-1 text-left text-xs font-semibold hover:underline', senderColor(sender.id))}
          >
            {sender.name}
          </button>
        )}

        <div
          className={cn(
            'rounded-lg px-3.5 py-2 text-base leading-relaxed shadow-sm',
            props.isOwn && 'rounded-br-sm bg-primary text-primary-foreground',
            !props.isOwn && 'rounded-bl-sm border border-border bg-card text-foreground',
          )}
        >
          <MessageContent text={message.content} renderMarkdown={false} isOwn={props.isOwn} />
        </div>

        <div className="mt-1 px-0.5 text-xs text-muted-foreground">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
}

/**
 * Group Chats: percakapan satu grup.
 */
export default function GroupConversation(props) {
  const group = findGroup(props.groupId);
  const user = useAuthStore((state) => state.user);
  const contactsById = useContactsById();
  const openView = useUiStore((state) => state.openView);

  const [extraMessages, setExtraMessages] = useState([]);
  const bottomRef = useRef(null);

  // Pesan yang diketik user hanya disimpan di layar ini (belum ada API grup).
  useEffect(() => {
    setExtraMessages([]);
  }, [props.groupId]);

  const messages = useMemo(() => {
    if (!group) {
      return [];
    }

    return [...group.messages, ...extraMessages];
  }, [group, extraMessages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: 'end' });
    }
  }, [messages.length, props.groupId]);

  if (!group) {
    return null;
  }

  const people = group.members.map((member) => resolvePerson(member.id, contactsById, user)).filter(Boolean);
  const onlineCount = people.filter((person) => person.online).length;

  function sendMessage(text) {
    const message = { id: `local-${Date.now()}`, senderId: 'me', content: text, createdAt: new Date().toISOString() };
    setExtraMessages((current) => [...current, message]);
  }

  function openMember(personId) {
    if (personId !== 'me') {
      openView(VIEWS.memberDetails, personId);
    }
  }

  return (
    <>
      <PageHeader
        leading={<GroupAvatar name={group.name} size="md" />}
        title={group.name}
        subtitle={`${people.length} members · ${onlineCount} online`}
        actions={
          <>
            {group.muted && (
              <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
                <BellOff aria-hidden="true" /> Muted
              </Badge>
            )}
            <AvatarStack people={people} max={4} className="mr-1 hidden md:flex" />
            <IconButton label="Group info" variant="outline" onClick={() => openView(VIEWS.groupDetails, group.id)}>
              <Info className="size-[18px]" />
            </IconButton>
          </>
        }
      />

      {group.pinned && (
        <div className="flex shrink-0 items-start gap-2.5 border-b border-border bg-soft px-4 py-2.5 text-sm">
          <Pin className="mt-0.5 size-4 shrink-0 text-primary dark:text-brand-300" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-foreground">
            <span className="font-semibold">Pinned · </span>
            {group.pinned}
          </p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex w-full flex-1 flex-col gap-4 px-4 py-5 sm:px-5">
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const sender = resolvePerson(message.senderId, contactsById, user) || { id: message.senderId, name: 'Unknown' };
            const startsNewDay = !isSameDay(previous, message);
            const showHeader = startsNewDay || !previous || previous.senderId !== message.senderId;

            return (
              <Fragment key={message.id}>
                {startsNewDay && <DateSeparator label={formatDayLabel(message.createdAt)} />}
                <GroupMessage
                  message={message}
                  sender={sender}
                  isOwn={message.senderId === 'me'}
                  showHeader={showHeader}
                  onOpenMember={openMember}
                />
              </Fragment>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput
        conversationId={group.id}
        placeholder={`Message ${group.name}...`}
        disabled={false}
        connectionNotice={null}
        onSend={sendMessage}
        onTyping={() => {}}
      />
    </>
  );
}

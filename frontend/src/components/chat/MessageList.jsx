import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LoaderCircle, SearchX } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { formatDayLabel } from '../../utils/formatters';
import { useDeleteMessage } from '../../hooks/useChatData';
import ConfirmDialog from '../ui/ConfirmDialog';
import MessageBubble, { DELIVERY } from './MessageBubble';
import TypingBubble from './TypingBubble';
import SuggestionChips, { ASSISTANT_SUGGESTIONS } from './SuggestionChips';

/**
 * Mencari nama & jenis pengirim sebuah pesan dari daftar peserta percakapan.
 */
function findSender(message, conversation) {
  if (message.senderRole === 'assistant') {
    return { name: 'AI Assistant', isAssistant: true };
  }

  const participant = conversation.participants.find((item) => item.userId === message.senderId);

  if (participant && participant.user) {
    return { name: participant.user.name, isAssistant: false };
  }

  return { name: 'Unknown', isAssistant: false };
}

function isSameSender(firstMessage, secondMessage) {
  if (!firstMessage || !secondMessage) {
    return false;
  }

  return firstMessage.senderRole === secondMessage.senderRole && firstMessage.senderId === secondMessage.senderId;
}

function isSameDay(firstMessage, secondMessage) {
  if (!firstMessage || !secondMessage) {
    return false;
  }

  return new Date(firstMessage.createdAt).toDateString() === new Date(secondMessage.createdAt).toDateString();
}

/**
 * Pesan sendiri dianggap "read" jika sudah ada pesan setelahnya dari pihak lain
 * (lawan bicara atau AI). Server belum menyimpan status baca, jadi ini penentuan dari sisi client.
 */
function getDeliveryStatus(messages, index) {
  const message = messages[index];

  for (let nextIndex = index + 1; nextIndex < messages.length; nextIndex = nextIndex + 1) {
    const nextMessage = messages[nextIndex];
    const isFromOtherSide = nextMessage.senderRole === 'assistant' || nextMessage.senderId !== message.senderId;

    if (isFromOtherSide) {
      return DELIVERY.read;
    }
  }

  return DELIVERY.sent;
}

function DateSeparator(props) {
  return (
    <div className="flex items-center gap-4 py-0.5" role="separator" aria-label={props.label}>
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full border border-line bg-surface px-3 py-0.5 text-xs font-medium text-ink-muted shadow-sm">
        {props.label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function CenteredNotice(props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-16 text-center text-ink-muted">
      {props.icon}
      <p className="max-w-sm text-sm">{props.children}</p>
    </div>
  );
}

export default function MessageList(props) {
  const bottomRef = useRef(null);
  const messages = props.messages;
  const conversation = props.conversation;

  const deleteMessage = useDeleteMessage();
  const [messageToDelete, setMessageToDelete] = useState(null);

  function confirmDeleteMessage() {
    if (!messageToDelete) {
      return;
    }

    deleteMessage.mutate(
      { conversationId: conversation.id, messageId: messageToDelete.id },
      { onSettled: () => setMessageToDelete(null) },
    );
  }

  // Scroll ke pesan paling bawah setiap ada pesan baru / indikator mengetik.
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, props.typingInfo.assistant, props.typingInfo.userIds.length, conversation.id]);

  if (props.isLoading) {
    return (
      <CenteredNotice icon={<LoaderCircle className="h-5 w-5 animate-spin text-brand-600" />}>Loading messages...</CenteredNotice>
    );
  }

  const isSearching = props.searchText.trim() !== '';
  const lastMessage = messages[messages.length - 1];

  const showSuggestions =
    props.isAssistant &&
    !isSearching &&
    !props.typingInfo.assistant &&
    Boolean(lastMessage) &&
    lastMessage.senderRole === 'assistant';

  let otherUserName = 'them';
  if (props.otherUser && props.otherUser.name) {
    otherUserName = props.otherUser.name;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-4 px-4 py-5 sm:px-5">
      {messages.length === 0 && isSearching && (
        <CenteredNotice icon={<SearchX className="h-5 w-5" />}>No messages match “{props.searchText}”.</CenteredNotice>
      )}

      {messages.length === 0 && !isSearching && !props.isAssistant && (
        <CenteredNotice icon={<Avatar name={otherUserName} size="lg" />}>
          This is the beginning of your chat with <strong className="text-ink">{otherUserName}</strong>. Say hi! 👋
        </CenteredNotice>
      )}

      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const isOwn = message.senderRole === 'user' && message.senderId === props.currentUserId;

        const startsNewDay = !isSameDay(previousMessage, message);

        let deliveryStatus;
        if (isOwn) {
          deliveryStatus = getDeliveryStatus(messages, index);
        }

        return (
          <Fragment key={message.id}>
            {startsNewDay && <DateSeparator label={formatDayLabel(message.createdAt)} />}
            <MessageBubble
              message={message}
              isOwn={isOwn}
              sender={findSender(message, conversation)}
              showAvatar={startsNewDay || !isSameSender(previousMessage, message)}
              deliveryStatus={deliveryStatus}
              canDelete={isOwn || (props.isAssistant && message.senderRole === 'assistant')}
              onDelete={setMessageToDelete}
            />
          </Fragment>
        );
      })}

      <AnimatePresence>
        {props.typingInfo.assistant && <TypingBubble key="assistant-typing" isAssistant />}

        {!props.isAssistant && props.typingInfo.userIds.length > 0 && (
          <TypingBubble key="user-typing" name={otherUserName} />
        )}
      </AnimatePresence>

      {showSuggestions && <SuggestionChips suggestions={ASSISTANT_SUGGESTIONS} onSelect={props.onSuggestion} />}

      <div ref={bottomRef} />

      <ConfirmDialog
        isOpen={Boolean(messageToDelete)}
        title="Delete this message?"
        description="The message will be removed for everyone in this chat. This can't be undone."
        confirmLabel="Delete message"
        isLoading={deleteMessage.isPending}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setMessageToDelete(null)}
      />
    </div>
  );
}

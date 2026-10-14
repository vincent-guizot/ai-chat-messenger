import { formatTime } from '../../utils/formatters';

const OWN_MESSAGE_CLASS = 'ml-auto bg-gradient-to-r from-indigo-600 to-cyan-500 text-white';
const OTHER_MESSAGE_CLASS = 'mr-auto border-slate-700 bg-slate-800/80 text-slate-100';

function getSenderLabel(message, isOwnMessage) {
  if (isOwnMessage) {
    return 'You';
  }

  if (message.senderRole === 'assistant') {
    return 'Assistant';
  }

  return 'Member';
}

export default function MessageBubble(props) {
  const message = props.message;
  const isOwnMessage = message.senderRole === 'user' && message.senderId === props.currentUserId;
  const time = formatTime(message.createdAt);

  let bubbleClass = OTHER_MESSAGE_CLASS;
  if (isOwnMessage) {
    bubbleClass = OWN_MESSAGE_CLASS;
  }

  return (
    <div className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-lg ${bubbleClass}`} title={time}>
      <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] opacity-80">
        <span>{getSenderLabel(message, isOwnMessage)}</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

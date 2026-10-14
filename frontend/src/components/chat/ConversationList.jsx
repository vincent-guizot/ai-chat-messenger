import Avatar from '../common/Avatar';
import { getConversationBadge } from '../../utils/formatters';

const ACTIVE_ITEM_CLASS = 'border-violet-400/70 bg-violet-500/10';
const INACTIVE_ITEM_CLASS = 'border-transparent bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800/80';

function ConversationItem(props) {
  const conversation = props.conversation;

  let stateClass = INACTIVE_ITEM_CLASS;
  if (props.isActive) {
    stateClass = ACTIVE_ITEM_CLASS;
  }

  function handleClick() {
    props.onSelect(conversation);
  }

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${stateClass}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <Avatar label={getConversationBadge(conversation)} />
        <div>
          <div className="font-semibold text-slate-100">{conversation.title || 'Conversation'}</div>
          <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{conversation.type}</div>
        </div>
      </div>
    </button>
  );
}

export default function ConversationList(props) {
  if (props.isLoading) {
    return <div className="text-sm text-slate-300">Loading conversations...</div>;
  }

  if (props.conversations.length === 0) {
    return <div className="text-sm text-slate-300">No chats found</div>;
  }

  let activeConversationId = null;
  if (props.activeConversation) {
    activeConversationId = props.activeConversation.id;
  }

  return (
    <div className="space-y-2">
      {props.conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onSelect={props.onSelect}
        />
      ))}
    </div>
  );
}

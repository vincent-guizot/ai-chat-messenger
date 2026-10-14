import Avatar from '../common/Avatar';
import { getConversationBadge } from '../../utils/formatters';

const CONNECTION_LABELS = {
  connected: 'Online',
  connecting: 'Connecting...',
};

export default function ChatHeader(props) {
  const conversation = props.conversation;
  const connectionLabel = CONNECTION_LABELS[props.connectionStatus] || 'Offline';

  function handleSearchChange(event) {
    props.onMessageSearchChange(event.target.value);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-700/80 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Avatar label={getConversationBadge(conversation)} />
        <div>
          <div className="text-lg font-bold text-slate-100">{conversation.title || 'Conversation'}</div>
          <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{conversation.type}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={props.messageSearch}
          onChange={handleSearchChange}
          placeholder="Search messages..."
          className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 md:w-56"
        />
        <div className="text-sm text-slate-300">{connectionLabel}</div>
        <Avatar size="small" label={props.userInitials} title={props.userName} />
      </div>
    </div>
  );
}

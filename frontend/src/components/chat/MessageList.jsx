import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessageList(props) {
  const containerRef = useRef(null);

  // Selalu scroll ke pesan paling bawah ketika ada pesan baru.
  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [props.messages, props.isAssistantTyping]);

  const showEmptyState = !props.isLoading && props.messages.length === 0;

  return (
    <div ref={containerRef} className="flex h-[68vh] flex-col gap-3 overflow-y-auto pr-1">
      {props.isLoading && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
          Loading messages...
        </div>
      )}

      {showEmptyState && (
        <div className="grid h-full place-items-center text-sm uppercase tracking-[0.18em] text-violet-300/80">
          Start the conversation
        </div>
      )}

      {props.messages.map((message) => (
        <MessageBubble key={message.id} message={message} currentUserId={props.currentUserId} />
      ))}

      {props.isAssistantTyping && <TypingIndicator />}
    </div>
  );
}

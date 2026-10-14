import React from 'react';

export default function Message({ message }) {
  const isUser = message.senderRole === 'user';
  const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-lg ${isUser ? 'ml-auto bg-gradient-to-r from-indigo-600 to-cyan-500 text-white' : 'mr-auto border-slate-700 bg-slate-800/80 text-slate-100'}`} title={time}>
      <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] opacity-80">
        <span>{isUser ? 'You' : 'Assistant'}</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

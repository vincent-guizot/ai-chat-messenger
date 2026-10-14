import React from 'react';

export default function Message({ message }) {
  const isUser = message.senderRole === 'user';
  const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`msg ${isUser ? 'user' : 'assistant'}`} title={time}>
      <div className="msg-content">{message.content}</div>
      <div className="msg-meta">
        <small className="muted">{message.senderRole === 'user' ? 'You' : 'Assistant'}</small>
        <small className="msg-time muted">{time}</small>
      </div>
    </div>
  );
}

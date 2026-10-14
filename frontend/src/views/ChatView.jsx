import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../stores/auth';
import socket from '../socket';

const apiBase = import.meta.env.VITE_API_BASE || '';

export default function ChatView() {
  const { user, token, clearAuth } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);

  const initials = useMemo(() => {
    if (!user?.name) return 'AI';
    return user.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    socket.on('connect', () => {
      console.log('connected to socket', socket.id);
    });

    socket.on('message:new', (msg) => {
      setMessages((current) => {
        const exists = current.some((m) => m.id === msg.id);
        return exists ? current : [...current, msg];
      });
    });

    return () => {
      socket.off('message:new');
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadConversations();
  }, [token]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadConversations() {
    const response = await fetch(`${apiBase}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!data.ok) return;
    if (data.conversations?.length) {
      setConversations(data.conversations);
      setActiveConversation(data.conversations[0]);
      loadMessages(data.conversations[0].id);
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }

  async function loadMessages(conversationId) {
    const response = await fetch(`${apiBase}/api/conversations/${conversationId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!data.ok) return;
    setMessages(data.messages || []);
    socket.emit('join', { conversationId });
  }

  async function createAiConversation() {
    const response = await fetch(`${apiBase}/api/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: 'ai', title: 'AI Assistant', withAi: true }) });
    const data = await response.json();
    if (data.ok) { await loadConversations(); } else { alert(data.error || 'Failed to create AI conversation'); }
  }

  function openConversation(conversation) { setActiveConversation(conversation); loadMessages(conversation.id); }

  function sendMessage() {
    if (!input.trim() || !activeConversation) return;
    socket.emit('message:create', { conversationId: activeConversation.id, content: input });
    setInput('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="header">
          <div>
            <div className="brand-small">Workspace</div>
            <div className="brand">AI Messenger</div>
          </div>

          <button className="btn btn-secondary" onClick={clearAuth}>Logout</button>
        </div>

        <div className="conversation-list">
          <button className="btn" onClick={createAiConversation} style={{ marginBottom: 12 }}>+ AI Chat</button>

          {conversations.length === 0 && (<div className="muted">No chats yet</div>)}

          {conversations.map((conversation) => (
            <div key={conversation.id} className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`} onClick={() => openConversation(conversation)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar">{(conversation.title || 'AI').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{conversation.title || 'Conversation'}</div>
                  <small className="muted">{conversation.type}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-panel">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-title-wrap">
                <div className="avatar">{(activeConversation.title || 'AI').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{activeConversation.title || 'Conversation'}</div>
                  <small className="muted">{activeConversation.type}</small>
                </div>
              </div>

              <div className="avatar" title={user?.name || 'You'}>{initials}</div>
            </div>

            <div className="messages" ref={messagesRef}>
              {messages.length === 0 && (<div className="empty-state">Start the conversation</div>)}
              {messages.map((message) => (
                <div key={message.id} className={`msg ${message.senderRole === 'user' ? 'user' : 'assistant'}`}>{message.content}</div>
              ))}
            </div>

            <div className="composer">
              <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Write a message..." />
              <button className="btn" onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty-state">Select a conversation</div>
        )}
      </main>
    </div>
  );
}

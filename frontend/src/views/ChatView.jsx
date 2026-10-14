import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../stores/auth';
import socket from '../socket';
import Message from '../components/Message';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

const apiBase = import.meta.env.VITE_API_BASE || '';

export default function ChatView() {
  const { user, token, clearAuth } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messagesAll, setMessagesAll] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [convoSearch, setConvoSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const messagesRef = useRef(null);

  const initials = useMemo(() => {
    if (!user?.name) return 'AI';
    return user.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    setConnectionStatus(socket.connected ? 'connected' : 'connecting');

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    socket.on('message:new', (msg) => {
      setMessagesAll((cur) => {
        const exists = cur.some((m) => m.id === msg.id);
        if (exists) return cur;
        return [...cur, msg];
      });

      // apply message search filter
      setMessages((cur) => {
        const merged = [...messagesAll, msg];
        const q = messageSearch.trim().toLowerCase();
        if (!q) return merged;
        return merged.filter((m) => m.content.toLowerCase().includes(q));
      });

      if (msg.senderRole === 'assistant') {
        setIsGenerating(false);
      }
    });

    return () => {
      socket.off('message:new');
      socket.disconnect();
    };
  }, [token, messageSearch]);

  useEffect(() => {
    if (!token) return;
    loadConversations();
  }, [token]);

  useEffect(() => {
    // filter conversations by search
    if (!convoSearch.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const q = convoSearch.trim().toLowerCase();
    setFilteredConversations(
      conversations.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.participants || []).some((p) => (p.user?.name || '').toLowerCase().includes(q)))
    );
  }, [convoSearch, conversations]);

  useEffect(() => {
    // apply message search on existing messagesAll
    if (!messageSearch.trim()) {
      setMessages(messagesAll);
      return;
    }
    const q = messageSearch.trim().toLowerCase();
    setMessages(messagesAll.filter((m) => m.content.toLowerCase().includes(q)));
  }, [messageSearch, messagesAll]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadConversations() {
    setLoadingConvos(true);
    try {
      const response = await fetch(`${apiBase}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load conversations');

      setConversations(data.conversations || []);
      setFilteredConversations(data.conversations || []);

      if (data.conversations?.length) {
        setActiveConversation(data.conversations[0]);
        await loadMessages(data.conversations[0].id);
      } else {
        setActiveConversation(null);
        setMessagesAll([]);
        setMessages([]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load conversations');
    } finally {
      setLoadingConvos(false);
    }
  }

  async function loadMessages(conversationId) {
    setLoadingMessages(true);
    try {
      const response = await fetch(`${apiBase}/api/conversations/${conversationId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load messages');

      setMessagesAll(data.messages || []);
      setMessages(data.messages || []);
      socket.emit('join', { conversationId });
    } catch (err) {
      showToast(err.message || 'Failed to load messages');
      setMessagesAll([]);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createAiConversation() {
    try {
      const response = await fetch(`${apiBase}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'ai', title: 'AI Assistant', withAi: true }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to create AI conversation');

      await loadConversations();
    } catch (err) {
      showToast(err.message || 'Failed to create AI conversation');
    }
  }

  function openConversation(conversation) {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function sendMessage() {
    if (!input.trim() || !activeConversation) return;
    setSending(true);

    // optimistic UI
    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: user?.id,
      senderRole: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessagesAll((cur) => [...cur, optimistic]);
    setMessages((cur) => [...cur, optimistic]);
    socket.emit('message:create', { conversationId: activeConversation.id, content: input.trim() });
    setInput('');
    setSending(false);
    setIsGenerating(true);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Header userInitials={initials} onLogout={clearAuth} connectionStatus={connectionStatus} />

        <div className="p-2">
          <SearchBar value={convoSearch} onChange={setConvoSearch} placeholder="Search conversations or contacts..." />

          <button className="btn w-full" onClick={createAiConversation} style={{ marginBottom: 12 }} disabled={loadingConvos}>+ AI Chat</button>

          {loadingConvos && <div className="muted">Loading conversations...</div>}

          {!loadingConvos && filteredConversations.length === 0 && <div className="muted">No chats found</div>}

          <div className="conversation-list">
            {filteredConversations.map((conversation) => (
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder="Search messages..." className="input" style={{ width: 260 }} />
                <div className="muted">{connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}</div>
                <div className="avatar" title={user?.name || 'You'}>{initials}</div>
              </div>
            </div>

            <div className="messages" ref={messagesRef}>
              {loadingMessages && <div className="skeleton">Loading messages...</div>}

              {messages.length === 0 && !loadingMessages && <div className="empty-state">Start the conversation</div>}

              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}

              {isGenerating && (
                <div className="msg assistant typing">
                  <div className="typing-dots"><span></span><span></span><span></span></div>
                </div>
              )}
            </div>

            <div className="composer">
              <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Write a message..." disabled={sending || connectionStatus !== 'connected'} />
              <button className="btn" onClick={sendMessage} disabled={sending || connectionStatus !== 'connected'}>{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </>
        ) : (
          <div className="empty-state">Select a conversation</div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}

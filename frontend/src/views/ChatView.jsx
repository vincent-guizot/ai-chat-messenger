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

    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('error'));

    socket.on('message:new', (msg) => {
      setMessagesAll((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        const next = exists ? prev : [...prev, msg];
        return next;
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
    if (!convoSearch.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const q = convoSearch.trim().toLowerCase();
    setFilteredConversations(
      conversations.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.participants || []).some((p) => (p.user?.name || '').toLowerCase().includes(q))
      )
    );
  }, [convoSearch, conversations]);

  useEffect(() => {
    if (!messageSearch.trim()) {
      setMessages(messagesAll);
      return;
    }
    const q = messageSearch.trim().toLowerCase();
    setMessages(messagesAll.filter((m) => m.content?.toLowerCase().includes(q)));
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

      const next = data.messages || [];
      setMessagesAll(next);
      setMessages(next);
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
    window.setTimeout(() => setToast(null), 3500);
  }

  function sendMessage() {
    if (!input.trim() || !activeConversation) return;

    const trimmed = input.trim();
    setSending(true);

    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: user?.id,
      senderRole: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessagesAll((prev) => [...prev, optimistic]);
    setMessages((prev) => [...prev, optimistic]);
    socket.emit('message:create', { conversationId: activeConversation.id, content: trimmed });
    setInput('');
    setIsGenerating(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-4 shadow-2xl backdrop-blur-xl">
          <Header userInitials={initials} onLogout={clearAuth} connectionStatus={connectionStatus} />

          <div className="space-y-3">
            <SearchBar value={convoSearch} onChange={setConvoSearch} placeholder="Search conversations or contacts..." />

            <button className="w-full rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60" onClick={createAiConversation} disabled={loadingConvos}>+ AI Chat</button>

            {loadingConvos && <div className="text-sm text-slate-300">Loading conversations...</div>}
            {!loadingConvos && filteredConversations.length === 0 && <div className="text-sm text-slate-300">No chats found</div>}

            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${activeConversation?.id === conversation.id ? 'border-violet-400/70 bg-violet-500/10' : 'border-transparent bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800/80'}`}
                  onClick={() => openConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                      {(conversation.title || 'AI').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{conversation.title || 'Conversation'}</div>
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{conversation.type}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-4 shadow-2xl backdrop-blur-xl">
          {activeConversation ? (
            <>
              <div className="mb-4 flex flex-col gap-3 border-b border-slate-700/80 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                    {(activeConversation.title || 'AI').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-100">{activeConversation.title || 'Conversation'}</div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{activeConversation.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder="Search messages..." className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 md:w-56" />
                  <div className="text-sm text-slate-300">{connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}</div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white" title={user?.name || 'You'}>{initials}</div>
                </div>
              </div>

              <div ref={messagesRef} className="flex h-[68vh] flex-col gap-3 overflow-y-auto pr-1">
                {loadingMessages && <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">Loading messages...</div>}
                {!loadingMessages && messages.length === 0 && <div className="grid h-full place-items-center text-sm uppercase tracking-[0.18em] text-violet-300/80">Start the conversation</div>}

                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}

                {isGenerating && (
                  <div className="max-w-[80%] rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-slate-100">
                    <div className="typing-dots flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3 border-t border-slate-700/80 pt-4">
                <input
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Write a message..."
                  disabled={sending || connectionStatus !== 'connected'}
                />
                <button className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60" onClick={sendMessage} disabled={sending || connectionStatus !== 'connected'}>{sending ? 'Sending...' : 'Send'}</button>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center text-sm uppercase tracking-[0.18em] text-violet-300/80">Select a conversation</div>
          )}

          {toast && <div className="fixed bottom-5 right-5 rounded-xl border border-violet-500/30 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-2xl">{toast}</div>}
        </main>
      </div>
    </div>
  );
}

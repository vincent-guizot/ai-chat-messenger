import { useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import useChat from '../hooks/useChat';
import { getInitials } from '../utils/formatters';
import SidebarHeader from '../components/chat/SidebarHeader';
import ConversationList from '../components/chat/ConversationList';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import SearchBar from '../components/common/SearchBar';
import Toast from '../components/common/Toast';

function filterConversations(conversations, searchText) {
  const query = searchText.trim().toLowerCase();

  if (query === '') {
    return conversations;
  }

  return conversations.filter((conversation) => {
    const title = (conversation.title || '').toLowerCase();

    if (title.includes(query)) {
      return true;
    }

    const participants = conversation.participants || [];

    return participants.some((participant) => {
      let participantName = '';
      if (participant.user && participant.user.name) {
        participantName = participant.user.name.toLowerCase();
      }

      return participantName.includes(query);
    });
  });
}

function filterMessages(messages, searchText) {
  const query = searchText.trim().toLowerCase();

  if (query === '') {
    return messages;
  }

  return messages.filter((message) => {
    const content = (message.content || '').toLowerCase();
    return content.includes(query);
  });
}

export default function ChatPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const chat = useChat(token, user);

  const [conversationSearch, setConversationSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');

  let userId = null;
  let userFullName = null;
  if (user) {
    userId = user.id;
    userFullName = user.name;
  }

  const userName = userFullName || 'You';
  const userInitials = getInitials(userFullName, 'AI');

  const visibleConversations = useMemo(() => {
    return filterConversations(chat.conversations, conversationSearch);
  }, [chat.conversations, conversationSearch]);

  const visibleMessages = useMemo(() => {
    return filterMessages(chat.messages, messageSearch);
  }, [chat.messages, messageSearch]);

  const isInputDisabled = chat.connectionStatus !== 'connected';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-4 shadow-2xl backdrop-blur-xl">
          <SidebarHeader
            userInitials={userInitials}
            onLogout={clearAuth}
            connectionStatus={chat.connectionStatus}
          />

          <div className="space-y-3">
            <SearchBar
              value={conversationSearch}
              onChange={setConversationSearch}
              placeholder="Search conversations or contacts..."
            />

            <button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={chat.createAiConversation}
              disabled={chat.loadingConversations}
            >
              + AI Chat
            </button>

            <ConversationList
              conversations={visibleConversations}
              activeConversation={chat.activeConversation}
              isLoading={chat.loadingConversations}
              onSelect={chat.openConversation}
            />
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-4 shadow-2xl backdrop-blur-xl">
          {chat.activeConversation ? (
            <>
              <ChatHeader
                conversation={chat.activeConversation}
                connectionStatus={chat.connectionStatus}
                messageSearch={messageSearch}
                onMessageSearchChange={setMessageSearch}
                userInitials={userInitials}
                userName={userName}
              />

              <MessageList
                messages={visibleMessages}
                currentUserId={userId}
                isLoading={chat.loadingMessages}
                isAssistantTyping={chat.isAssistantTyping}
              />

              <MessageInput onSend={chat.sendMessage} disabled={isInputDisabled} />
            </>
          ) : (
            <div className="grid h-full place-items-center text-sm uppercase tracking-[0.18em] text-violet-300/80">
              Select a conversation
            </div>
          )}

          <Toast message={chat.toastMessage} />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { toTypingInfo, useChatStore } from '../stores/chatStore';
import { SIDEBAR_TABS, useUiStore } from '../stores/uiStore';
import useChatSocket from '../hooks/useChatSocket';
import useSendMessage from '../hooks/useSendMessage';
import { useAutoReadActiveConversation } from '../hooks/useNotifications';
import {
  useActiveConversation,
  useContactsById,
  useConversationsQuery,
  useCreateAiConversation,
  useMessagesQuery,
} from '../hooks/useChatData';
import { findOtherUser, getConversationTitle, isAssistantConversation } from '../utils/conversations';
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import WelcomeScreen from '../components/chat/WelcomeScreen';
import Toast from '../components/ui/Toast';

const EMPTY_LIST = [];

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

/**
 * Pesan status koneksi di atas kotak input.
 * tone "warning" (kuning) saat menghubungkan, "danger" (merah) saat terputus.
 */
function getConnectionNotice(connectionStatus) {
  if (connectionStatus === 'connecting') {
    return { text: 'Connecting to the server...', tone: 'warning' };
  }

  if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
    return { text: 'You are offline. Reconnecting...', tone: 'danger' };
  }

  return null;
}

/**
 * Pintasan keyboard Alt + N untuk membuat chat AI baru.
 * (Ctrl + N tidak bisa dipakai karena sudah dipakai browser untuk membuka jendela baru.)
 */
function useNewChatShortcut(onNewChat) {
  useEffect(() => {
    function handleKeyDown(event) {
      const isAltN = event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyN';

      if (isAltN) {
        event.preventDefault();
        onNewChat();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNewChat]);
}

export default function ChatPage() {
  useChatSocket();
  useAutoReadActiveConversation();

  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const resetChatStore = useChatStore((state) => state.reset);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const typing = useChatStore((state) => state.typingByConversation[activeConversationId]);

  const conversationsQuery = useConversationsQuery();
  const conversations = conversationsQuery.data || EMPTY_LIST;
  const activeConversation = useActiveConversation();
  const contactsById = useContactsById();
  const messagesQuery = useMessagesQuery(activeConversationId);
  const createAiConversation = useCreateAiConversation();
  const messageSender = useSendMessage(activeConversationId);

  const [searchText, setSearchText] = useState('');

  let currentUserId = null;
  if (user) {
    currentUserId = user.id;
  }

  // Saat pertama dibuka, langsung pilih percakapan teratas.
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);

      if (!isAssistantConversation(conversations[0])) {
        setActiveTab(SIDEBAR_TABS.direct);
      }
    }
  }, [activeConversationId, conversations, setActiveConversationId, setActiveTab]);

  // Kosongkan pencarian setiap pindah percakapan.
  useEffect(() => {
    setSearchText('');
  }, [activeConversationId]);

  function startNewAiChat() {
    if (!createAiConversation.isPending) {
      createAiConversation.mutate();
    }
  }

  useNewChatShortcut(startNewAiChat);

  function showContacts() {
    setActiveTab(SIDEBAR_TABS.contacts);
    setMobileSidebarOpen(true);
  }

  function handleLogout() {
    clearAuth();
    resetChatStore();
    queryClient.clear();
  }

  const messages = messagesQuery.data || EMPTY_LIST;
  const visibleMessages = useMemo(() => filterMessages(messages, searchText), [messages, searchText]);

  const isAssistant = isAssistantConversation(activeConversation);
  const otherUser = findOtherUser(activeConversation, currentUserId, contactsById);
  const typingInfo = toTypingInfo(typing);

  let title = '';
  let inputPlaceholder = 'Write a message...';

  if (activeConversation) {
    title = getConversationTitle(activeConversation, otherUser);
    inputPlaceholder = `Message ${title}...`;
  }

  let isOtherSideTyping = typingInfo.userIds.length > 0;
  if (isAssistant) {
    isOtherSideTyping = typingInfo.assistant;
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar onLogout={handleLogout} />

      <main className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-navy-950">
        <ChatHeader
          hasConversation={Boolean(activeConversation)}
          title={title}
          isAssistant={isAssistant}
          otherUser={otherUser}
          isTyping={isOtherSideTyping}
          searchText={searchText}
          onSearchChange={setSearchText}
          onNewChat={startNewAiChat}
          onLogout={handleLogout}
        />

        {!activeConversation && (
          <WelcomeScreen
            onStartAiChat={startNewAiChat}
            onShowContacts={showContacts}
            isCreating={createAiConversation.isPending}
          />
        )}

        {activeConversation && (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <MessageList
                conversation={activeConversation}
                messages={visibleMessages}
                currentUserId={currentUserId}
                isAssistant={isAssistant}
                otherUser={otherUser}
                typingInfo={typingInfo}
                isLoading={messagesQuery.isLoading}
                searchText={searchText}
                onSuggestion={messageSender.sendMessage}
              />
            </div>

            <MessageInput
              conversationId={activeConversation.id}
              placeholder={inputPlaceholder}
              disabled={connectionStatus !== 'connected'}
              connectionNotice={getConnectionNotice(connectionStatus)}
              onSend={messageSender.sendMessage}
              onTyping={messageSender.notifyTyping}
            />
          </>
        )}
      </main>

      <Toast />
    </div>
  );
}

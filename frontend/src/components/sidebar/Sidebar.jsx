import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronsLeft, ChevronsRight, Plus, SquarePen, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { SIDEBAR_TABS, useUiStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import {
  useContactsById,
  useContactsQuery,
  useConversationsQuery,
  useCreateAiConversation,
  useOpenConversation,
  useOpenDirectConversation,
} from '../../hooks/useChatData';
import { useUnreadCountByConversation } from '../../hooks/useNotifications';
import { isAssistantConversation, isDirectConversation } from '../../utils/conversations';
import useMinuteTick from '../../hooks/useMinuteTick';
import AppLogo from '../ui/AppLogo';
import IconButton from '../ui/IconButton';
import SidebarNav from './SidebarNav';
import UserFooter from './UserFooter';
import { AssistantConversationList, ContactList, DirectConversationList } from './SidebarLists';

const EXPANDED_WIDTH = 312;
const COLLAPSED_WIDTH = 84;
const EMPTY_LIST = [];

const SECTION_TITLES = {
  [SIDEBAR_TABS.assistant]: 'AI Chats',
  [SIDEBAR_TABS.direct]: 'Direct Messages',
  [SIDEBAR_TABS.contacts]: 'Contacts',
};

/**
 * Hiasan gelombang biru lembut di sudut kiri bawah sidebar (murni dekoratif).
 */
function SidebarDecoration() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-6 -left-10 h-56 w-72 opacity-80 dark:opacity-40"
      viewBox="0 0 288 224"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sidebar-wave" x1="0" y1="224" x2="220" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2160F5" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8EB2FB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 224V92c58 6 112 44 150 92 14 17 34 30 56 40H0Z" fill="url(#sidebar-wave)" />
    </svg>
  );
}

/**
 * Isi sidebar. Dipakai di dua tempat: sidebar tetap (layar besar) dan laci (layar kecil).
 */
function SidebarContent(props) {
  const isCollapsed = props.isCollapsed;

  // Perbarui teks "Last seen ..." setiap menit.
  useMinuteTick();

  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const toggleSidebarCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);
  const activeConversationId = useChatStore((state) => state.activeConversationId);

  const conversationsQuery = useConversationsQuery();
  const contactsQuery = useContactsQuery();
  const contactsById = useContactsById();
  const unreadByConversation = useUnreadCountByConversation();

  const openConversation = useOpenConversation();
  const createAiConversation = useCreateAiConversation();
  const openDirectConversation = useOpenDirectConversation();

  const conversations = conversationsQuery.data || EMPTY_LIST;
  const contacts = contactsQuery.data || EMPTY_LIST;

  const assistantConversations = useMemo(() => conversations.filter(isAssistantConversation), [conversations]);
  const directConversations = useMemo(() => conversations.filter(isDirectConversation), [conversations]);
  const onlineCount = contacts.filter((contact) => contact.online).length;

  let unreadDirectCount = 0;
  for (const conversation of directConversations) {
    unreadDirectCount = unreadDirectCount + (unreadByConversation[conversation.id] || 0);
  }

  let CollapseIcon = ChevronsLeft;
  let collapseLabel = 'Collapse sidebar';
  if (isCollapsed) {
    CollapseIcon = ChevronsRight;
    collapseLabel = 'Expand sidebar';
  }

  // Tombol "+" di judul daftar: chat AI baru (tab AI) atau cari teman chat (tab Direct Messages).
  function handlePlusClick() {
    if (activeTab === SIDEBAR_TABS.assistant) {
      createAiConversation.mutate();
    } else {
      setActiveTab(SIDEBAR_TABS.contacts);
    }
  }

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-hidden border-r border-line bg-surface px-4 py-5 text-ink shadow-sm">
      <SidebarDecoration />

      {/* Logo & tombol ciutkan */}
      <div className={cn('relative flex items-center gap-3', isCollapsed && 'flex-col')}>
        <AppLogo />
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-2xl font-bold leading-none tracking-tight text-ink">Chibi Room</div>
            <div className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              AI + Real-time Messaging
            </div>
          </div>
        )}

        {props.onClose && (
          <IconButton variant="sidebar" size="sm" label="Close menu" onClick={props.onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        )}

        {!props.onClose && (
          <IconButton variant="sidebar" size="sm" label={collapseLabel} onClick={toggleSidebarCollapsed}>
            <CollapseIcon className="h-5 w-5" />
          </IconButton>
        )}
      </div>

      {/* Tombol chat AI baru */}
      <button
        type="button"
        onClick={() => createAiConversation.mutate()}
        disabled={createAiConversation.isPending}
        title="New Chat (Alt + N)"
        className={cn(
          'relative flex h-12 items-center gap-3 rounded-md bg-brand-600 px-4 text-base font-semibold text-white shadow-md transition-colors',
          'hover:bg-brand-700 disabled:opacity-70',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <SquarePen className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="flex-1 text-left">New Chat</span>}
        {!isCollapsed && (
          <kbd className="rounded-sm bg-white/15 px-2 py-1 font-sans text-xs font-medium text-white">
            Alt N
          </kbd>
        )}
      </button>

      <div className="relative">
        <SidebarNav
        activeTab={activeTab}
        onChange={setActiveTab}
        isCollapsed={isCollapsed}
        onlineCount={onlineCount}
        unreadDirectCount={unreadDirectCount}
        />
      </div>

      <div className="relative h-px bg-line" />

      {/* Daftar sesuai tab yang aktif */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!isCollapsed && (
          <div className="mb-2 flex items-center justify-between px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{SECTION_TITLES[activeTab]}</h2>

            {activeTab !== SIDEBAR_TABS.contacts && (
              <IconButton
                variant="ghost"
                size="sm"
                label={activeTab === SIDEBAR_TABS.assistant ? 'New AI chat' : 'Find someone to chat with'}
                onClick={handlePlusClick}
                className="-mr-2"
              >
                <Plus className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {activeTab === SIDEBAR_TABS.assistant && (
            <AssistantConversationList
              conversations={assistantConversations}
              isLoading={conversationsQuery.isLoading}
              activeConversationId={activeConversationId}
              isCollapsed={isCollapsed}
              onOpen={openConversation}
            />
          )}

          {activeTab === SIDEBAR_TABS.direct && (
            <DirectConversationList
              conversations={directConversations}
              contactsById={contactsById}
              unreadByConversation={unreadByConversation}
              isLoading={conversationsQuery.isLoading}
              activeConversationId={activeConversationId}
              isCollapsed={isCollapsed}
              onOpen={openConversation}
            />
          )}

          {activeTab === SIDEBAR_TABS.contacts && (
            <ContactList
              contacts={contacts}
              isLoading={contactsQuery.isLoading}
              isCollapsed={isCollapsed}
              onStartChat={(userId) => openDirectConversation.mutate(userId)}
            />
          )}
        </div>
      </div>

      <div className="relative">
        <UserFooter isCollapsed={isCollapsed} onLogout={props.onLogout} />
      </div>
    </div>
  );
}

export default function Sidebar(props) {
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  let desktopWidth = EXPANDED_WIDTH;
  if (isSidebarCollapsed) {
    desktopWidth = COLLAPSED_WIDTH;
  }

  return (
    <>
      {/* Layar besar: sidebar tetap di kiri */}
      <motion.aside
        className="hidden h-full shrink-0 overflow-hidden lg:block"
        initial={false}
        animate={{ width: desktopWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} onLogout={props.onLogout} />
      </motion.aside>

      {/* Layar kecil: sidebar berupa laci yang bisa dibuka/tutup */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[min(300px,88vw)]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <SidebarContent
                isCollapsed={false}
                onLogout={props.onLogout}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

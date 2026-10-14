import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronsLeft, ChevronsRight, SquarePen, X } from 'lucide-react';
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

const EXPANDED_WIDTH = 288;
const COLLAPSED_WIDTH = 68;
const EMPTY_LIST = [];

const SECTION_TITLES = {
  [SIDEBAR_TABS.assistant]: 'AI Chats',
  [SIDEBAR_TABS.direct]: 'Direct Messages',
  [SIDEBAR_TABS.contacts]: 'Contacts',
};

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

  return (
    <div className="flex h-full flex-col gap-4 border-r border-navy-800 bg-navy-900 px-3 py-4 text-white">
      {/* Logo & tombol ciutkan */}
      <div className={cn('flex items-center gap-2.5 px-1', isCollapsed && 'flex-col')}>
        <AppLogo />
        {!isCollapsed && <span className="flex-1 truncate text-[15px] font-semibold">AI Chat Messenger</span>}

        {props.onClose && (
          <IconButton variant="sidebar" size="sm" label="Close menu" onClick={props.onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        )}

        {!props.onClose && (
          <IconButton variant="sidebar" size="sm" label={collapseLabel} onClick={toggleSidebarCollapsed}>
            <CollapseIcon className="h-4 w-4" />
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
          'flex h-9 items-center gap-2.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition-colors',
          'hover:bg-brand-700 disabled:opacity-70',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <SquarePen className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="flex-1 text-left">New Chat</span>}
        {!isCollapsed && (
          <kbd className="rounded border border-white/25 px-1.5 py-px font-sans text-[10px] font-medium text-white/80">
            Alt N
          </kbd>
        )}
      </button>

      <SidebarNav
        activeTab={activeTab}
        onChange={setActiveTab}
        isCollapsed={isCollapsed}
        onlineCount={onlineCount}
        unreadDirectCount={unreadDirectCount}
      />

      <div className="h-px bg-navy-800" />

      {/* Daftar sesuai tab yang aktif */}
      <div className="flex min-h-0 flex-1 flex-col">
        {!isCollapsed && (
          <h2 className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {SECTION_TITLES[activeTab]}
          </h2>
        )}

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
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

      <UserFooter isCollapsed={isCollapsed} onLogout={props.onLogout} />
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
              className="absolute inset-0 bg-navy-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[min(288px,85vw)]"
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

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
import { isAssistantConversation, isDirectConversation } from '../../utils/conversations';
import useMinuteTick from '../../hooks/useMinuteTick';
import AppLogo from '../ui/AppLogo';
import IconButton from '../ui/IconButton';
import SidebarNav from './SidebarNav';
import UserFooter from './UserFooter';
import { AssistantConversationList, ContactList, DirectConversationList } from './SidebarLists';

const EXPANDED_WIDTH = 360;
const COLLAPSED_WIDTH = 96;
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

  const openConversation = useOpenConversation();
  const createAiConversation = useCreateAiConversation();
  const openDirectConversation = useOpenDirectConversation();

  const conversations = conversationsQuery.data || EMPTY_LIST;
  const contacts = contactsQuery.data || EMPTY_LIST;

  const assistantConversations = useMemo(() => conversations.filter(isAssistantConversation), [conversations]);
  const directConversations = useMemo(() => conversations.filter(isDirectConversation), [conversations]);
  const onlineCount = contacts.filter((contact) => contact.online).length;

  let CollapseIcon = ChevronsLeft;
  let collapseLabel = 'Collapse sidebar';
  if (isCollapsed) {
    CollapseIcon = ChevronsRight;
    collapseLabel = 'Expand sidebar';
  }

  return (
    <div className="sidebar-background flex h-full flex-col gap-6 px-5 py-6 text-white">
      {/* Logo & tombol ciutkan */}
      <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
        <AppLogo />
        {!isCollapsed && <span className="flex-1 truncate text-xl font-bold tracking-tight">AI Chat Messenger</span>}

        {props.onClose && (
          <IconButton variant="sidebar" label="Close menu" onClick={props.onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        )}

        {!props.onClose && (
          <IconButton variant="sidebar" label={collapseLabel} onClick={toggleSidebarCollapsed}>
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
          'flex h-14 items-center gap-4 rounded-2xl border border-brand-300/40 bg-gradient-to-r from-brand-500 to-brand-600 px-5 text-[15px] font-semibold text-white shadow-glow transition',
          'hover:-translate-y-px hover:from-brand-400 disabled:opacity-70',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <SquarePen className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="flex-1 text-left">New Chat</span>}
        {!isCollapsed && (
          <kbd className="rounded-lg border border-white/25 bg-white/10 px-2 py-0.5 font-sans text-xs font-medium text-white/80">
            Alt N
          </kbd>
        )}
      </button>

      <SidebarNav activeTab={activeTab} onChange={setActiveTab} isCollapsed={isCollapsed} onlineCount={onlineCount} />

      <div className="h-px bg-white/10" />

      {/* Daftar sesuai tab yang aktif */}
      <div className="-mx-2 flex min-h-0 flex-1 flex-col">
        {!isCollapsed && (
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/80">
            {SECTION_TITLES[activeTab]}
          </h2>
        )}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
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
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} onLogout={props.onLogout} />
      </motion.aside>

      {/* Layar kecil: sidebar berupa laci yang bisa dibuka/tutup */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[min(360px,88vw)] shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
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

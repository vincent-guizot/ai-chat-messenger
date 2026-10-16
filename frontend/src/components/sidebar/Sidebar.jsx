import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronsLeft, ChevronsRight, Plus, SquarePen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIDEBAR_TABS, useUiStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import {
  useContactsById,
  useContactsQuery,
  useConversationsQuery,
  useCreateAiConversation,
  useDeleteConversation,
  useOpenConversation,
  useOpenDirectConversation,
} from '@/hooks/useChatData';
import { useUnreadCountByConversation } from '@/hooks/useNotifications';
import { isAssistantConversation, isDirectConversation } from '@/utils/conversations';
import useMinuteTick from '@/hooks/useMinuteTick';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import AppLogo from '@/components/shared/AppLogo';
import BrandName from '@/components/shared/BrandName';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import IconButton from '@/components/shared/IconButton';
import SidebarNav from './SidebarNav';
import UserFooter from './UserFooter';
import { AssistantConversationList, ContactList, DirectConversationList } from './SidebarLists';

const EXPANDED_WIDTH = 288;
const COLLAPSED_WIDTH = 72;
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
 * Isi sidebar. Dipakai di dua tempat: sidebar tetap (layar besar) dan Sheet (layar kecil).
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
  const deleteConversation = useDeleteConversation();

  // Percakapan ({ id, title }) yang sedang menunggu konfirmasi hapus.
  const [conversationToDelete, setConversationToDelete] = useState(null);

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

  let plusLabel = 'Find someone to chat with';
  if (activeTab === SIDEBAR_TABS.assistant) {
    plusLabel = 'New AI chat';
  }

  function confirmDeleteConversation() {
    if (!conversationToDelete) {
      return;
    }

    deleteConversation.mutate(conversationToDelete.id, {
      onSettled: () => setConversationToDelete(null),
    });
  }

  let deleteTitle = '';
  if (conversationToDelete) {
    deleteTitle = conversationToDelete.title;
  }

  let logoSize = 'md';
  if (isCollapsed) {
    logoSize = 'sm';
  }

  return (
    <div className="relative flex h-full flex-col gap-3 overflow-hidden px-3 py-4 text-foreground">
      <SidebarDecoration />

      {/* Logo & tombol ciutkan */}
      <div className={cn('relative flex items-center gap-3', isCollapsed && 'flex-col')}>
        <AppLogo size={logoSize} />
        {!isCollapsed && <BrandName className="flex-1" />}

        {!props.isInsideSheet && (
          <IconButton label={collapseLabel} size="icon-sm" onClick={toggleSidebarCollapsed}>
            <CollapseIcon className="size-5" />
          </IconButton>
        )}
      </div>

      {/* Tombol chat AI baru */}
      <Button
        size="lg"
        onClick={() => createAiConversation.mutate()}
        disabled={createAiConversation.isPending}
        title="New Chat (Alt + N)"
        className={cn('relative justify-start gap-3 px-4 shadow-md', isCollapsed && 'justify-center px-0')}
      >
        <SquarePen className="size-[18px]" aria-hidden="true" />
        {!isCollapsed && <span className="flex-1 text-left">New Chat</span>}
        {!isCollapsed && <Kbd>Alt N</Kbd>}
      </Button>

      <div className="relative">
        <SidebarNav
          activeTab={activeTab}
          onChange={setActiveTab}
          isCollapsed={isCollapsed}
          onlineCount={onlineCount}
          unreadDirectCount={unreadDirectCount}
        />
      </div>

      <Separator className="relative" />

      {/* Daftar sesuai tab yang aktif */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!isCollapsed && (
          <div className="mb-2 flex items-center justify-between px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{SECTION_TITLES[activeTab]}</h2>

            {activeTab !== SIDEBAR_TABS.contacts && (
              <IconButton label={plusLabel} size="icon-sm" onClick={handlePlusClick} className="-mr-2">
                <Plus className="size-5" />
              </IconButton>
            )}
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:space-y-1">
          {activeTab === SIDEBAR_TABS.assistant && (
            <AssistantConversationList
              conversations={assistantConversations}
              isLoading={conversationsQuery.isLoading}
              activeConversationId={activeConversationId}
              isCollapsed={isCollapsed}
              onOpen={openConversation}
              onDelete={setConversationToDelete}
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
              onDelete={setConversationToDelete}
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
        </ScrollArea>
      </div>

      <div className="relative">
        <UserFooter isCollapsed={isCollapsed} onLogout={props.onLogout} />
      </div>

      <ConfirmDialog
        isOpen={Boolean(conversationToDelete)}
        title="Delete this chat?"
        description={`“${deleteTitle}” will be removed from your chats. This can't be undone.`}
        confirmLabel="Delete chat"
        isLoading={deleteConversation.isPending}
        onConfirm={confirmDeleteConversation}
        onCancel={() => setConversationToDelete(null)}
      />
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
      {/* Layar besar: sidebar tetap di kiri, berupa kartu terpisah dari area chat */}
      <motion.aside
        className="hidden h-full shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-card lg:block"
        initial={false}
        animate={{ width: desktopWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} onLogout={props.onLogout} />
      </motion.aside>

      {/* Layar kecil: sidebar berupa Sheet yang meluncur dari kiri */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" showCloseButton className="w-[min(300px,88vw)] gap-0 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Chats, contacts, and account</SheetDescription>
          <SidebarContent isCollapsed={false} isInsideSheet onLogout={props.onLogout} />
        </SheetContent>
      </Sheet>
    </>
  );
}

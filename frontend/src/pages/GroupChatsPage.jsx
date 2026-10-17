import { useMemo, useState } from 'react';
import { BellOff, Globe, Lock, Plus, Search, SearchX, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { VIEWS, useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useContactsById } from '@/hooks/useChatData';
import { GROUPS, resolvePerson } from '@/data/groups';
import { formatRelativeTime, truncate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import AvatarStack from '@/components/shared/AvatarStack';
import GroupAvatar from '@/components/groups/GroupAvatar';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'muted', label: 'Muted' },
  { id: 'public', label: 'Public' },
];

function matchesFilter(group, filterId) {
  if (filterId === 'unread') {
    return group.unread > 0;
  }

  if (filterId === 'muted') {
    return group.muted;
  }

  if (filterId === 'public') {
    return group.privacy === 'public';
  }

  return true;
}

function GroupCard(props) {
  const group = props.group;
  const contactsById = useContactsById();
  const user = useAuthStore((state) => state.user);

  const people = group.members.map((member) => resolvePerson(member.id, contactsById, user)).filter(Boolean);
  const lastMessage = group.messages[group.messages.length - 1];

  let lastSenderName = '';
  if (lastMessage) {
    const sender = resolvePerson(lastMessage.senderId, contactsById, user);
    lastSenderName = sender ? sender.name.split(' ')[0] : '';
    if (lastMessage.senderId === 'me') {
      lastSenderName = 'You';
    }
  }

  let PrivacyIcon = Lock;
  if (group.privacy === 'public') {
    PrivacyIcon = Globe;
  }

  return (
    <button
      type="button"
      onClick={() => props.onOpen(group.id)}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <GroupAvatar name={group.name} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">{group.name}</h3>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <PrivacyIcon className="size-3" aria-hidden="true" />
            <span className="capitalize">{group.privacy}</span>
            <span aria-hidden="true">·</span>
            <span>{people.length} members</span>
          </p>
        </div>

        {group.muted && <BellOff className="mt-1 size-4 shrink-0 text-muted-foreground" aria-label="Muted" />}
        {!group.muted && group.unread > 0 && (
          <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
            {group.unread}
          </Badge>
        )}
      </div>

      <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{group.description}</p>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <AvatarStack people={people} max={4} size="xs" />

        {lastMessage && (
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{lastSenderName}: </span>
            {truncate(lastMessage.content, 22)} · {formatRelativeTime(lastMessage.createdAt)}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Group Chats: daftar semua grup (kartu), dengan pencarian & filter.
 */
export default function GroupChatsPage() {
  const openView = useUiStore((state) => state.openView);
  const [searchText, setSearchText] = useState('');
  const [filterId, setFilterId] = useState('all');

  const visibleGroups = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return GROUPS.filter((group) => {
      const matchesSearch = query === '' || group.name.toLowerCase().includes(query);
      return matchesSearch && matchesFilter(group, filterId);
    });
  }, [searchText, filterId]);

  const unreadTotal = GROUPS.reduce((total, group) => total + group.unread, 0);

  return (
    <>
      <PageHeader
        leading={
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary dark:text-brand-300">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
        }
        title="Group Chats"
        subtitle={`${GROUPS.length} groups · ${unreadTotal} unread messages`}
        actions={
          <Button size="sm" onClick={() => toast.info('Create group is coming soon')}>
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">New group</span>
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search groups..."
                aria-label="Search groups"
                className="bg-card pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter groups">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={filterId === filter.id}
                  onClick={() => setFilterId(filter.id)}
                  className={cn(
                    'h-8 rounded-full border px-3.5 text-xs font-medium transition-colors',
                    filterId === filter.id && 'border-primary bg-primary text-primary-foreground',
                    filterId !== filter.id && 'border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {visibleGroups.length === 0 && (
            <div className="flex flex-col items-center gap-2.5 py-16 text-center text-muted-foreground">
              <SearchX className="size-6" aria-hidden="true" />
              <p className="text-sm">No groups match your search.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleGroups.map((group) => (
              <GroupCard key={group.id} group={group} onOpen={(groupId) => openView(VIEWS.groupChat, groupId)} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

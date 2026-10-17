import { useState } from 'react';
import {
  BellOff,
  Check,
  Copy,
  FileText,
  Globe,
  Lock,
  Image as ImageIcon,
  Link2,
  LogOut,
  MessageSquare,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { VIEWS, useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useContactsById } from '@/hooks/useChatData';
import { GROUP_ROLES, SHARED_MEDIA_TONES, findGroup, resolvePerson } from '@/data/groups';
import { formatLastSeen } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import UserAvatar, { toPresenceStatus } from '@/components/shared/UserAvatar';
import SectionCard from '@/components/shared/SectionCard';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import GroupAvatar from '@/components/groups/GroupAvatar';

function ToggleSwitch(props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      onClick={() => props.onChange(!props.checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        props.checked && 'bg-primary',
        !props.checked && 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform', props.checked && 'translate-x-5')}
      />
    </button>
  );
}

function RoleBadge(props) {
  if (props.role === 'owner') {
    return <Badge variant="default">{GROUP_ROLES.owner}</Badge>;
  }

  if (props.role === 'admin') {
    return <Badge variant="secondary">{GROUP_ROLES.admin}</Badge>;
  }

  return null;
}

function MediaStat(props) {
  const Icon = props.icon;

  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-muted px-2 py-3">
      <Icon className="size-4 text-primary dark:text-brand-300" aria-hidden="true" />
      <span className="text-lg font-semibold leading-none text-foreground">{props.count}</span>
      <span className="text-xs text-muted-foreground">{props.label}</span>
    </div>
  );
}

function MemberRow(props) {
  const person = props.person;

  let statusText = 'Online';
  if (!person.online) {
    statusText = formatLastSeen(person.lastSeenAt);
  }

  let displayName = person.name;
  if (person.isMe) {
    displayName = `${person.name} (You)`;
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => props.onOpen(person.id)}
        disabled={person.isMe}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors enabled:hover:bg-muted"
      >
        <UserAvatar name={person.name} size="md" status={toPresenceStatus(person.online)} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-foreground">{displayName}</div>
          <div className={cn('truncate text-sm text-muted-foreground', person.online && 'font-medium text-success')}>{statusText}</div>
        </div>

        <RoleBadge role={props.role} />
      </button>
    </li>
  );
}

/**
 * Group Details: info grup, anggota, media bersama, pengaturan, dan zona berbahaya.
 */
export default function GroupDetailsPage(props) {
  const group = findGroup(props.groupId);
  const user = useAuthStore((state) => state.user);
  const contactsById = useContactsById();
  const openView = useUiStore((state) => state.openView);
  const goBack = useUiStore((state) => state.goBack);

  const [memberSearch, setMemberSearch] = useState('');
  const [isMuted, setIsMuted] = useState(group ? group.muted : false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  if (!group) {
    return null;
  }

  const inviteLink = `chibi.room/join/${group.id}-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const members = group.members
    .map((member) => ({ role: member.role, person: resolvePerson(member.id, contactsById, user) }))
    .filter((item) => item.person);

  const onlineCount = members.filter((item) => item.person.online).length;
  const query = memberSearch.trim().toLowerCase();
  const visibleMembers = members.filter((item) => item.person.name.toLowerCase().includes(query));

  const myRole = group.members.find((member) => member.id === 'me');
  const canManage = Boolean(myRole) && myRole.role !== 'member';

  const createdLabel = new Date(group.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

  function copyInviteLink() {
    setIsLinkCopied(true);
    toast.success('Invite link copied');
    window.setTimeout(() => setIsLinkCopied(false), 2000);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).catch(() => {});
    }
  }

  function confirmLeave() {
    setIsLeaveOpen(false);
    toast.success(`You left ${group.name}`);
    openView(VIEWS.groups);
  }

  return (
    <>
      <PageHeader
        onBack={goBack}
        title="Group details"
        subtitle={group.name}
        actions={
          <Button size="sm" onClick={() => openView(VIEWS.groupChat, group.id)}>
            <MessageSquare aria-hidden="true" />
            <span className="hidden sm:inline">Open chat</span>
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6">
          {/* Profil grup */}
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="h-24 bg-gradient-to-r from-brand-600 via-brand-500 to-sky-400 sm:h-28" aria-hidden="true" />

            <div className="px-5 pb-5">
              <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-start">
                <GroupAvatar name={group.name} size="xl" className="shrink-0 ring-4 ring-card" />

                <div className="min-w-0 flex-1 sm:pt-12">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">{group.name}</h2>
                    <Badge variant="secondary" className="gap-1 capitalize">
                      {group.privacy === 'public' ? <Globe aria-hidden="true" /> : <Lock aria-hidden="true" />}
                      {group.privacy}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {members.length} members · {onlineCount} online · Created {createdLabel}
                  </p>
                </div>

                {canManage && (
                  <Button variant="outline" size="sm" className="sm:mt-12" onClick={() => toast.info('Add members is coming soon')}>
                    <UserPlus aria-hidden="true" />
                    Add members
                  </Button>
                )}
              </div>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground">{group.description}</p>
            </div>
          </section>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Anggota */}
            <SectionCard title={`Members · ${members.length}`}>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Search members..."
                  aria-label="Search members"
                  className="bg-background pl-9"
                />
              </div>

              <ul className="-mx-2 divide-y divide-border/60">
                {visibleMembers.map((item) => (
                  <MemberRow
                    key={item.person.id}
                    person={item.person}
                    role={item.role}
                    onOpen={(personId) => openView(VIEWS.memberDetails, personId)}
                  />
                ))}
              </ul>

              {visibleMembers.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No members found.</p>}
            </SectionCard>

            <div className="space-y-5">
              <SectionCard title="Shared media">
                <div className="flex gap-2">
                  <MediaStat icon={ImageIcon} count={group.media.photos} label="Photos" />
                  <MediaStat icon={FileText} count={group.media.files} label="Files" />
                  <MediaStat icon={Link2} count={group.media.links} label="Links" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
                  {SHARED_MEDIA_TONES.map((tone) => (
                    <div key={tone} className={cn('aspect-square rounded-lg opacity-80 dark:opacity-40', tone)} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Invite link">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background py-1 pl-3 pr-1">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{inviteLink}</span>
                  <Button variant="secondary" size="sm" onClick={copyInviteLink} aria-label="Copy invite link">
                    {isLinkCopied && <Check aria-hidden="true" />}
                    {!isLinkCopied && <Copy aria-hidden="true" />}
                    {isLinkCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Settings">
                <div className="flex items-center gap-3">
                  <BellOff className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-medium text-foreground">Mute notifications</div>
                    <div className="text-sm text-muted-foreground">No alerts from this group</div>
                  </div>
                  <ToggleSwitch checked={isMuted} onChange={setIsMuted} label="Mute notifications" />
                </div>
              </SectionCard>

              <SectionCard title="Danger zone" className="border-destructive/30">
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start text-destructive hover:text-destructive" onClick={() => setIsLeaveOpen(true)}>
                    <LogOut aria-hidden="true" />
                    Leave group
                  </Button>

                  {myRole && myRole.role === 'owner' && (
                    <Button variant="destructive" className="justify-start" onClick={() => toast.info('Delete group is coming soon')}>
                      <Trash2 aria-hidden="true" />
                      Delete group
                    </Button>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLeaveOpen}
        title="Leave this group?"
        description={`You will no longer receive messages from “${group.name}”.`}
        confirmLabel="Leave group"
        isLoading={false}
        onConfirm={confirmLeave}
        onCancel={() => setIsLeaveOpen(false)}
      />
    </>
  );
}

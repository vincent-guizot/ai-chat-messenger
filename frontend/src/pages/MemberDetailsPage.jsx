import { useState } from 'react';
import { BellOff, Ban, Calendar, Mail, MapPin, MessageSquare, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { VIEWS, useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useContactsById, useOpenDirectConversation } from '@/hooks/useChatData';
import { GROUP_ROLES, getGroupsOfPerson, resolvePerson } from '@/data/groups';
import { formatLastSeen, getHandle } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import UserAvatar from '@/components/shared/UserAvatar';
import SectionCard from '@/components/shared/SectionCard';
import GroupAvatar from '@/components/groups/GroupAvatar';

function InfoRow(props) {
  const Icon = props.icon;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-soft text-primary dark:text-brand-300">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{props.label}</div>
        <div className="truncate text-base font-medium text-foreground">{props.value}</div>
      </div>
    </div>
  );
}

/**
 * Member Details: profil satu anggota (kontak / anggota grup).
 */
export default function MemberDetailsPage(props) {
  const user = useAuthStore((state) => state.user);
  const contactsById = useContactsById();
  const openView = useUiStore((state) => state.openView);
  const goBack = useUiStore((state) => state.goBack);
  const openDirectConversation = useOpenDirectConversation();

  const [isMuted, setIsMuted] = useState(false);

  const person = resolvePerson(props.memberId, contactsById, user);

  if (!person) {
    return (
      <>
        <PageHeader onBack={goBack} title="Member details" />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Member not found.</div>
      </>
    );
  }

  const groups = getGroupsOfPerson(person.id);

  let statusText = 'Online';
  if (!person.online) {
    statusText = formatLastSeen(person.lastSeenAt);
  }

  let joinedLabel = '-';
  if (person.joinedAt) {
    joinedLabel = new Date(person.joinedAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function roleInGroup(group) {
    const member = group.members.find((item) => item.id === person.id);
    return member.role;
  }

  return (
    <>
      <PageHeader onBack={goBack} title="Member details" subtitle={person.name} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-5 sm:px-6">
          {/* Profil */}
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="h-24 bg-gradient-to-r from-navy-600 via-brand-600 to-sky-400 sm:h-28" aria-hidden="true" />

            <div className="px-5 pb-5">
              <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-start">
                <UserAvatar name={person.name} size="xl" className="size-20 shrink-0 text-2xl ring-4 ring-card" />

                <div className="min-w-0 flex-1 sm:pt-12">
                  <h2 className="truncate text-xl font-semibold text-foreground">{person.name}</h2>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <span>{getHandle(person.email)}</span>
                    {person.title && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{person.title}</span>
                      </>
                    )}
                  </p>
                  <p className={cn('mt-1 flex items-center gap-1.5 text-xs', person.online && 'font-medium text-success', !person.online && 'text-muted-foreground')}>
                    <span className={cn('size-2 rounded-full', person.online && 'bg-success', !person.online && 'bg-muted-foreground/60')} aria-hidden="true" />
                    {statusText}
                  </p>
                </div>

                {!person.isMe && (
                  <div className="flex gap-2 sm:pt-12">
                    <Button onClick={() => openDirectConversation.mutate(person.id)} disabled={openDirectConversation.isPending}>
                      <MessageSquare aria-hidden="true" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={() => setIsMuted(!isMuted)} aria-pressed={isMuted}>
                      <BellOff aria-hidden="true" />
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="grid items-start gap-5 md:grid-cols-2">
            <SectionCard title="About">
              {person.bio && <p className="mb-2 text-base leading-relaxed text-foreground">{person.bio}</p>}

              <div className="divide-y divide-border/60">
                <InfoRow icon={Mail} label="Email" value={person.email || '-'} />
                {person.location && <InfoRow icon={MapPin} label="Location" value={person.location} />}
                <InfoRow icon={Calendar} label="Joined" value={joinedLabel} />
                <InfoRow icon={UserRound} label="Handle" value={getHandle(person.email) || '-'} />
              </div>
            </SectionCard>

            <div className="space-y-5">
              <SectionCard title={`Groups in common · ${groups.length}`}>
                {groups.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No groups in common.</p>}

                <ul className="-mx-2 space-y-0.5">
                  {groups.map((group) => (
                    <li key={group.id}>
                      <button
                        type="button"
                        onClick={() => openView(VIEWS.groupDetails, group.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <GroupAvatar name={group.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-base font-semibold text-foreground">{group.name}</div>
                          <div className="text-sm text-muted-foreground">{group.members.length} members</div>
                        </div>
                        {roleInGroup(group) !== 'member' && <Badge variant="secondary">{GROUP_ROLES[roleInGroup(group)]}</Badge>}
                      </button>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {!person.isMe && (
                <SectionCard title="Privacy & support" className="border-destructive/30">
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => toast.info('Block is coming soon')}>
                    <Ban aria-hidden="true" />
                    Block {person.name.split(' ')[0]}
                  </Button>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, CircleAlert, Clock3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/formatters';
import { countEmojiOnly } from '@/utils/emoji';
import { TEMPORARY_ID_PREFIX } from '@/lib/chatCache';
import UserAvatar from '@/components/shared/UserAvatar';
import MessageContent from './MessageContent';

// Pesan sementara yang belum dikonfirmasi server selama ini dianggap gagal terkirim.
const SEND_TIMEOUT_MS = 20000;

// Pesan yang hanya berisi emoji sebanyak ini (atau kurang) ditampilkan besar tanpa gelembung.
const MAX_JUMBO_EMOJI = 3;

export const DELIVERY = {
  sending: 'sending',
  sent: 'sent',
  read: 'read',
  failed: 'failed',
};

// Setiap status punya ikon DAN teks yang berbeda, jadi tidak hanya mengandalkan warna.
const DELIVERY_STYLES = {
  [DELIVERY.sending]: { icon: Clock3, label: 'Sending', className: 'text-amber-500' },
  [DELIVERY.sent]: { icon: Check, label: 'Sent', className: 'text-success' },
  [DELIVERY.read]: { icon: CheckCheck, label: 'Read', className: 'text-brand-500 dark:text-brand-300' },
  [DELIVERY.failed]: { icon: CircleAlert, label: 'Failed to send', className: 'text-destructive' },
};

function DeliveryStatus(props) {
  const style = DELIVERY_STYLES[props.status];
  const Icon = style.icon;
  const showText = props.status === DELIVERY.sending || props.status === DELIVERY.failed;

  return (
    <span className={cn('inline-flex items-center gap-1', style.className)} title={style.label}>
      <Icon className="size-3.5" aria-hidden="true" />
      {showText && <span className="text-xs font-medium">{style.label}</span>}
      {!showText && <span className="sr-only">{style.label}</span>}
    </span>
  );
}

/**
 * Menentukan status kirim yang ditampilkan untuk pesan milik sendiri.
 */
function useDeliveryStatus(isTemporary, deliveryStatusFromProps) {
  // Pesan sementara yang tidak kunjung dikonfirmasi server -> "Failed to send".
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isTemporary) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setHasTimedOut(true), SEND_TIMEOUT_MS);

    return () => window.clearTimeout(timerId);
  }, [isTemporary]);

  if (isTemporary && hasTimedOut) {
    return DELIVERY.failed;
  }

  if (isTemporary) {
    return DELIVERY.sending;
  }

  return deliveryStatusFromProps || DELIVERY.sent;
}

/**
 * Satu pesan.
 *
 * Props:
 *   message         data pesan
 *   isOwn           pesan milik user yang sedang login (tampil di kanan)
 *   sender          { name, isAssistant } pengirim pesan
 *   showAvatar      false jika pesan sebelumnya dari pengirim yang sama (avatar tidak diulang)
 *   deliveryStatus  "sent" | "read" untuk pesan sendiri yang sudah tersimpan di server
 *   canDelete       true jika user boleh menghapus pesan ini (tombol hapus muncul saat hover)
 *   onDelete        dipanggil dengan pesan yang akan dihapus (konfirmasi ditangani induknya)
 */
export default function MessageBubble(props) {
  const message = props.message;
  const isOwn = props.isOwn;
  const isAssistant = message.senderRole === 'assistant';
  const isTemporary = String(message.id).startsWith(TEMPORARY_ID_PREFIX);
  const isError = Boolean(message.metadata && message.metadata.error);

  const deliveryStatus = useDeliveryStatus(isTemporary, props.deliveryStatus);
  const canDelete = Boolean(props.canDelete) && !isTemporary;

  // Pesan berisi 1-3 emoji saja ditampilkan besar tanpa latar gelembung.
  const emojiCount = countEmojiOnly(message.content);
  const isJumboEmoji = emojiCount > 0 && emojiCount <= MAX_JUMBO_EMOJI && !isAssistant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('group flex items-start gap-2.5', isOwn && 'flex-row-reverse', !props.showAvatar && '-mt-2')}
    >
      <div className="w-8 shrink-0">
        {props.showAvatar && <UserAvatar name={props.sender.name} isAssistant={props.sender.isAssistant} size="sm" />}
      </div>

      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[72%]', isOwn && 'items-end')}>
        {isJumboEmoji && (
          <div className="px-1 text-[2.5rem] leading-none" aria-label={message.content}>
            {message.content.trim()}
          </div>
        )}

        {!isJumboEmoji && (
          <div
            className={cn(
              'min-w-0 max-w-full overflow-hidden rounded-lg px-3.5 py-2 text-base leading-relaxed',
              isOwn && 'rounded-br-sm bg-primary text-primary-foreground shadow-sm',
              !isOwn && !isAssistant && 'rounded-bl-sm border border-border bg-card text-foreground shadow-sm',
              !isOwn && isAssistant && 'rounded-bl-sm border border-ai-line bg-ai-soft text-foreground shadow-sm',
              isError && 'border-destructive/30 bg-destructive/10 text-destructive',
              isTemporary && deliveryStatus === DELIVERY.sending && 'opacity-80',
            )}
          >
            <MessageContent text={message.content} renderMarkdown={isAssistant} isOwn={isOwn} />
          </div>
        )}

        <div className="mt-1 flex items-center gap-1.5 px-0.5 text-xs text-muted-foreground">
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && <DeliveryStatus status={deliveryStatus} />}
        </div>
      </div>

      {canDelete && (
        <button
          type="button"
          onClick={() => props.onDelete(message)}
          aria-label="Delete message"
          title="Delete message"
          className={cn(
            'mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition',
            'hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100',
            'opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100',
          )}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, CircleAlert, Clock3 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatTime } from '../../utils/formatters';
import { TEMPORARY_ID_PREFIX } from '../../lib/chatCache';
import Avatar from '../ui/Avatar';
import MessageContent from './MessageContent';

// Pesan sementara yang belum dikonfirmasi server selama ini dianggap gagal terkirim.
const SEND_TIMEOUT_MS = 20000;

export const DELIVERY = {
  sending: 'sending',
  sent: 'sent',
  read: 'read',
  failed: 'failed',
};

// Setiap status punya ikon DAN teks yang berbeda, jadi tidak hanya mengandalkan warna.
const DELIVERY_STYLES = {
  [DELIVERY.sending]: { icon: Clock3, label: 'Sending', className: 'text-ink-muted' },
  [DELIVERY.sent]: { icon: Check, label: 'Sent', className: 'text-ink-muted' },
  [DELIVERY.read]: { icon: CheckCheck, label: 'Read', className: 'text-brand-600 dark:text-brand-300' },
  [DELIVERY.failed]: { icon: CircleAlert, label: 'Failed to send', className: 'text-danger' },
};

function DeliveryStatus(props) {
  const style = DELIVERY_STYLES[props.status];
  const Icon = style.icon;
  const showText = props.status === DELIVERY.sending || props.status === DELIVERY.failed;

  return (
    <span className={cn('inline-flex items-center gap-1', style.className)} title={style.label}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showText && <span className="text-xs font-medium">{style.label}</span>}
      {!showText && <span className="sr-only">{style.label}</span>}
    </span>
  );
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
 */
export default function MessageBubble(props) {
  const message = props.message;
  const isOwn = props.isOwn;
  const isAssistant = message.senderRole === 'assistant';
  const isTemporary = String(message.id).startsWith(TEMPORARY_ID_PREFIX);
  const isError = Boolean(message.metadata && message.metadata.error);

  // Pesan sementara yang tidak kunjung dikonfirmasi server -> "Failed to send".
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isTemporary) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setHasTimedOut(true), SEND_TIMEOUT_MS);

    return () => window.clearTimeout(timerId);
  }, [isTemporary]);

  let deliveryStatus = props.deliveryStatus || DELIVERY.sent;
  if (isTemporary && hasTimedOut) {
    deliveryStatus = DELIVERY.failed;
  } else if (isTemporary) {
    deliveryStatus = DELIVERY.sending;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('flex items-start gap-3', isOwn && 'flex-row-reverse', !props.showAvatar && '-mt-2')}
    >
      <div className="w-10 shrink-0">
        {props.showAvatar && <Avatar name={props.sender.name} isAssistant={props.sender.isAssistant} size="md" />}
      </div>

      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]', isOwn && 'items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 text-[15px] leading-relaxed',
            isOwn && 'rounded-br-sm bg-brand-600 text-white shadow-sm',
            !isOwn && !isAssistant && 'rounded-bl-sm border border-line bg-surface text-ink shadow-sm',
            !isOwn && isAssistant && 'rounded-bl-sm border border-ai-line bg-ai-soft text-ink shadow-sm',
            isError && 'border-danger/30 bg-danger/10 text-danger',
            isTemporary && deliveryStatus === DELIVERY.sending && 'opacity-80',
          )}
        >
          <MessageContent text={message.content} renderMarkdown={isAssistant} isOwn={isOwn} />
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 px-0.5 text-xs text-ink-muted">
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && <DeliveryStatus status={deliveryStatus} />}
        </div>
      </div>
    </motion.div>
  );
}

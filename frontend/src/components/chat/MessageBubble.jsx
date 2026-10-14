import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { formatTime } from '../../utils/formatters';
import { TEMPORARY_ID_PREFIX } from '../../lib/chatCache';
import Avatar from '../ui/Avatar';
import MessageContent from './MessageContent';

/**
 * Satu pesan.
 *
 * Props:
 *   message     data pesan
 *   isOwn       pesan milik user yang sedang login (tampil di kanan)
 *   sender      { name, isAssistant } pengirim pesan
 *   showAvatar  false jika pesan sebelumnya dari pengirim yang sama (avatar tidak diulang)
 */
export default function MessageBubble(props) {
  const message = props.message;
  const isOwn = props.isOwn;
  const isAssistant = message.senderRole === 'assistant';
  const isSending = String(message.id).startsWith(TEMPORARY_ID_PREFIX);
  const isError = Boolean(message.metadata && message.metadata.error);

  let timeText = formatTime(message.createdAt);
  if (isSending) {
    timeText = 'Sending...';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('flex items-start gap-2.5', isOwn && 'flex-row-reverse', !props.showAvatar && '-mt-2')}
    >
      <div className="w-8 shrink-0">
        {props.showAvatar && <Avatar name={props.sender.name} isAssistant={props.sender.isAssistant} size="sm" />}
      </div>

      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]', isOwn && 'items-end')}>
        <div
          className={cn(
            'rounded-xl px-3.5 py-2 text-sm leading-relaxed',
            isOwn && 'rounded-tr-sm bg-brand-600 text-white',
            !isOwn && 'rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-card',
            !isOwn && 'dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100',
            isError && 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
            isSending && 'opacity-70',
          )}
        >
          <MessageContent text={message.content} renderMarkdown={isAssistant} isOwn={isOwn} />
        </div>

        <span className="mt-1 px-0.5 text-[11px] text-slate-400">{timeText}</span>
      </div>
    </motion.div>
  );
}

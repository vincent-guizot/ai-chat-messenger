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
 *   message       data pesan
 *   isOwn         pesan milik user yang sedang login (tampil di kanan)
 *   sender        { name, isAssistant } pengirim pesan
 *   showAvatar    false jika pesan sebelumnya dari pengirim yang sama (avatar tidak diulang)
 */
export default function MessageBubble(props) {
  const message = props.message;
  const isOwn = props.isOwn;
  const isAssistant = message.senderRole === 'assistant';
  const isSending = String(message.id).startsWith(TEMPORARY_ID_PREFIX);

  let timeText = formatTime(message.createdAt);
  if (isSending) {
    timeText = 'Sending...';
  }

  const avatar = (
    <div className="w-11 shrink-0">
      {props.showAvatar && <Avatar name={props.sender.name} isAssistant={props.sender.isAssistant} size="md" />}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex items-start gap-3 sm:gap-4', isOwn && 'flex-row-reverse')}
    >
      {avatar}

      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%]', isOwn && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:px-5',
            isOwn && 'rounded-tr-md bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow',
            !isOwn && 'rounded-tl-md border border-slate-200/80 bg-white text-slate-700 shadow-card',
            !isOwn && 'dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100',
            isSending && 'opacity-70',
          )}
        >
          <MessageContent text={message.content} renderMarkdown={isAssistant} isOwn={isOwn} />
        </div>

        <span className="mt-1.5 px-1 text-xs text-slate-400">{timeText}</span>
      </div>
    </motion.div>
  );
}

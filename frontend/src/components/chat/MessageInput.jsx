import { useEffect, useRef, useState } from 'react';
import { Paperclip, Plus, Send, Smile } from 'lucide-react';
import { cn } from '../../lib/cn';
import IconButton from '../ui/IconButton';

const MAX_TEXTAREA_HEIGHT_PX = 160;

// Fitur lampiran & emoji belum dibuat, fungsinya dikosongkan dulu.
function handleAddAttachment() {
  // TODO: unggah file.
}

function handleOpenEmojiPicker() {
  // TODO: tampilkan pemilih emoji.
}

/**
 * Kotak input pesan.
 * Enter = kirim, Shift + Enter = baris baru. Tinggi textarea menyesuaikan isi.
 */
export default function MessageInput(props) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Atur tinggi textarea mengikuti jumlah baris.
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [text]);

  // Fokus ke input setiap pindah percakapan.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [props.conversationId]);

  function submit() {
    if (props.disabled || text.trim() === '') {
      return;
    }

    props.onSend(text);
    setText('');
  }

  function handleChange(event) {
    setText(event.target.value);
    props.onTyping();
  }

  function handleKeyDown(event) {
    const isComposing = event.nativeEvent.isComposing;

    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const canSend = !props.disabled && text.trim() !== '';

  return (
    <div className="shrink-0 bg-canvas px-4 pb-4 pt-1 sm:px-5">
      <div>
        {props.connectionNotice && (
          <p
            className={cn(
              'mb-2 flex items-center justify-center gap-2 text-sm font-medium',
              props.connectionNotice.tone === 'warning' && 'text-amber-600 dark:text-warning',
              props.connectionNotice.tone === 'danger' && 'text-danger',
            )}
            role="status"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                props.connectionNotice.tone === 'warning' && 'bg-warning',
                props.connectionNotice.tone === 'danger' && 'bg-danger',
              )}
              aria-hidden="true"
            />
            {props.connectionNotice.text}
          </p>
        )}

        <div className="flex min-h-14 items-end gap-2 rounded-xl border border-line bg-surface p-2 shadow-sm transition-colors focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
          <IconButton variant="muted" size="md" label="Add" onClick={handleAddAttachment}>
            <Plus className="h-[18px] w-[18px]" />
          </IconButton>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            disabled={props.disabled}
            aria-label="Message"
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-5 text-ink placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed"
          />

          <div className="flex items-center self-end">
            <IconButton variant="ghost" size="sm" label="Attach file" onClick={handleAddAttachment} className="hidden sm:inline-flex">
              <Paperclip className="h-[18px] w-[18px]" />
            </IconButton>
            <IconButton variant="ghost" size="sm" label="Emoji" onClick={handleOpenEmojiPicker} className="hidden sm:inline-flex">
              <Smile className="h-[18px] w-[18px]" />
            </IconButton>
          </div>

          <IconButton variant="primary" size="md" label="Send message" onClick={submit} disabled={!canSend}>
            <Send className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

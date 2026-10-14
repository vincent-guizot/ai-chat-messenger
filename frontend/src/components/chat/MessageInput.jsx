import { useEffect, useRef, useState } from 'react';
import { Paperclip, Plus, SendHorizontal, Smile } from 'lucide-react';
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
    <div className="shrink-0 px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {props.connectionNotice && (
          <p
            className={cn(
              'mb-2 flex items-center justify-center gap-1.5 text-xs',
              props.connectionNotice.tone === 'warning' && 'text-amber-600 dark:text-warning',
              props.connectionNotice.tone === 'danger' && 'text-red-600 dark:text-red-400',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                props.connectionNotice.tone === 'warning' && 'bg-warning',
                props.connectionNotice.tone === 'danger' && 'bg-danger',
              )}
              aria-hidden="true"
            />
            {props.connectionNotice.text}
          </p>
        )}

        <div className="flex items-end gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-card transition-colors focus-within:border-brand-400 dark:border-navy-700 dark:bg-navy-900">
          <IconButton variant="muted" size="md" label="Add" onClick={handleAddAttachment}>
            <Plus className="h-4 w-4" />
          </IconButton>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed dark:text-slate-100"
          />

          <div className="flex items-center self-end">
            <IconButton variant="ghost" size="md" label="Attach file" onClick={handleAddAttachment} className="hidden sm:inline-flex">
              <Paperclip className="h-4 w-4" />
            </IconButton>
            <IconButton variant="ghost" size="md" label="Emoji" onClick={handleOpenEmojiPicker} className="hidden sm:inline-flex">
              <Smile className="h-4 w-4" />
            </IconButton>
          </div>

          <IconButton variant="primary" size="md" label="Send message" onClick={submit} disabled={!canSend}>
            <SendHorizontal className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

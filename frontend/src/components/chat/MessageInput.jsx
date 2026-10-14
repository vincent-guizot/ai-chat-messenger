import { useEffect, useRef, useState } from 'react';
import { Paperclip, Plus, SendHorizontal, Smile } from 'lucide-react';
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
    <div className="px-4 pb-4 sm:px-8 sm:pb-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-2 shadow-card transition focus-within:border-brand-300 sm:gap-3 sm:p-2.5 dark:border-white/10 dark:bg-white/[0.06]">
          <IconButton variant="muted" size="lg" label="Add" onClick={handleAddAttachment}>
            <Plus className="h-5 w-5" />
          </IconButton>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className="max-h-40 min-h-12 flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed dark:text-slate-100"
          />

          <div className="flex items-center gap-1 self-center">
            <IconButton variant="ghost" size="md" label="Attach file" onClick={handleAddAttachment} className="hidden sm:inline-flex">
              <Paperclip className="h-5 w-5" />
            </IconButton>
            <IconButton variant="ghost" size="md" label="Emoji" onClick={handleOpenEmojiPicker} className="hidden sm:inline-flex">
              <Smile className="h-5 w-5" />
            </IconButton>
          </div>

          <IconButton variant="primary" size="lg" label="Send message" onClick={submit} disabled={!canSend}>
            <SendHorizontal className="h-5 w-5" />
          </IconButton>
        </div>

        {props.statusText && <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{props.statusText}</p>}
      </div>
    </div>
  );
}

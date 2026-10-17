import { useEffect, useRef, useState } from 'react';
import { Paperclip, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertTextEmoticons, insertAtCursor } from '@/utils/emoji';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import IconButton from '@/components/shared/IconButton';
import EmojiPickerButton from './EmojiPickerButton';

const MAX_TEXTAREA_HEIGHT_PX = 160;

// Fitur lampiran belum dibuat, fungsinya dikosongkan dulu.
function handleAddAttachment() {
  // TODO: unggah file.
}

/**
 * Kotak input pesan.
 * Enter = kirim, Shift + Enter = baris baru. Tinggi textarea menyesuaikan isi.
 * Emoji bisa dipilih dari picker (disisipkan di posisi kursor) atau diketik sebagai
 * emoticon teks seperti ":)" dan "<3" yang diubah otomatis saat dikirim.
 */
export default function MessageInput(props) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Posisi kursor yang ingin dipulihkan setelah emoji disisipkan.
  const pendingCursorRef = useRef(null);

  // Atur tinggi textarea mengikuti jumlah baris.
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [text]);

  // Setelah emoji disisipkan, kembalikan fokus & kursor ke tepat setelah emoji.
  useEffect(() => {
    const textarea = textareaRef.current;
    const cursor = pendingCursorRef.current;

    if (textarea && cursor !== null) {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
      pendingCursorRef.current = null;
    }
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

    props.onSend(convertTextEmoticons(text));
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

  function handleEmojiSelect(emoji) {
    const result = insertAtCursor(text, textareaRef.current, emoji);

    pendingCursorRef.current = result.cursor;
    setText(result.value);
    props.onTyping();
  }

  const canSend = !props.disabled && text.trim() !== '';

  return (
    <div className="shrink-0 bg-background px-4 pb-4 pt-1 sm:px-5">
      <div className="w-full">
      {props.connectionNotice && (
        <p
          className={cn(
            'mb-2 flex items-center justify-center gap-2 text-sm font-medium',
            props.connectionNotice.tone === 'warning' && 'text-amber-600 dark:text-warning',
            props.connectionNotice.tone === 'danger' && 'text-destructive',
          )}
          role="status"
        >
          <span
            className={cn(
              'size-2 rounded-full',
              props.connectionNotice.tone === 'warning' && 'bg-warning',
              props.connectionNotice.tone === 'danger' && 'bg-destructive',
            )}
            aria-hidden="true"
          />
          {props.connectionNotice.text}
        </p>
      )}

      <div
        className={cn(
          'flex min-h-14 items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm transition-colors',
          'focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/10',
        )}
      >
        <IconButton label="Add" variant="outline" size="icon-lg" onClick={handleAddAttachment} className="bg-background">
          <Plus className="size-[18px]" />
        </IconButton>

        <Textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={props.placeholder}
          disabled={props.disabled}
          aria-label="Message"
          className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-base leading-5 shadow-none focus-visible:ring-0"
        />

        <div className="flex items-center gap-0.5 self-end">
          <IconButton label="Attach file" size="icon-sm" onClick={handleAddAttachment} className="hidden sm:inline-flex">
            <Paperclip className="size-[18px]" />
          </IconButton>
          <EmojiPickerButton onSelect={handleEmojiSelect} disabled={props.disabled} />
        </div>

        <Button size="icon-lg" aria-label="Send message" title="Send message" onClick={submit} disabled={!canSend} className="shadow-md">
          <Send className="size-[18px]" />
        </Button>
      </div>
      </div>
    </div>
  );
}

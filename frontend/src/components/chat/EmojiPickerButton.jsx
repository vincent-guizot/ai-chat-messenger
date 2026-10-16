import { lazy, Suspense, useState } from 'react';
import { LoaderCircle, Smile } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import IconButton from '@/components/shared/IconButton';

// Data emoji cukup besar, jadi picker baru dimuat saat pertama kali dibuka.
const EmojiPicker = lazy(() => import('emoji-picker-react'));

const PICKER_WIDTH = 320;
const PICKER_HEIGHT = 380;

function PickerLoading() {
  return (
    <div className="flex items-center justify-center text-muted-foreground" style={{ width: PICKER_WIDTH, height: PICKER_HEIGHT }}>
      <LoaderCircle className="size-5 animate-spin" aria-label="Loading emoji" />
    </div>
  );
}

/**
 * Tombol emoji di kotak input. Membuka emoji picker di Popover;
 * emoji yang dipilih dikirim lewat onSelect(emojiCharacter).
 */
export default function EmojiPickerButton(props) {
  const theme = useUiStore((state) => state.theme);
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiClick(emojiData) {
    props.onSelect(emojiData.emoji);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <IconButton label="Emoji" size="icon-sm" disabled={props.disabled} aria-expanded={isOpen}>
          <Smile className="size-[18px]" />
        </IconButton>
      </PopoverTrigger>

      <PopoverContent side="top" align="end" className="w-auto overflow-hidden p-0">
        <Suspense fallback={<PickerLoading />}>
          <EmojiPicker
            colorScheme={theme}
            width={PICKER_WIDTH}
            height={PICKER_HEIGHT}
            lazyLoadEmojis
            skinTonesDisabled={false}
            searchPlaceholder="Search emoji..."
            previewConfig={{ showPreview: false }}
            onEmojiClick={handleEmojiClick}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}

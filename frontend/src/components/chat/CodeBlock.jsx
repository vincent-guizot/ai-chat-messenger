import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { highlightCode } from '@/utils/highlightCode';

const COPIED_RESET_MS = 1800;

export default function CodeBlock(props) {
  const [isCopied, setIsCopied] = useState(false);
  const tokens = highlightCode(props.code);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(props.code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
    } catch (error) {
      // Clipboard bisa ditolak browser (mis. bukan https). Tidak perlu menampilkan apa-apa.
    }
  }

  let CopyIcon = Copy;
  let copyLabel = 'Copy';
  if (isCopied) {
    CopyIcon = Check;
    copyLabel = 'Copied';
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">{props.language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
            isCopied && 'text-success',
            !isCopied && 'text-muted-foreground hover:text-primary dark:hover:text-brand-300',
          )}
        >
          <CopyIcon className="size-3" aria-hidden="true" />
          {copyLabel}
        </button>
      </div>

      <pre className="max-w-full whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground">
        <code>
          {tokens.map((token, index) => {
            if (token.type === 'text') {
              return token.text;
            }

            return (
              <span key={index} className={`code-token-${token.type}`}>
                {token.text}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

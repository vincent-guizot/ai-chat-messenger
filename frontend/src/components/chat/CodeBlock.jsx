import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { highlightCode } from '../../utils/highlightCode';

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
    <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-navy-950/60">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-white/10">
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{props.language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          <CopyIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {copyLabel}
        </button>
      </div>

      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
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

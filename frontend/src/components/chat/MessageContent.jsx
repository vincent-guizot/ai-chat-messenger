import { Fragment, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseInline, parseMarkdown } from '@/utils/markdown';
import CodeBlock from './CodeBlock';

/**
 * Gambar dari balasan AI. Jika gagal dimuat, tampil kotak keterangan (bukan ikon rusak).
 */
function MessageImage(props) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <span className="my-1 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
        <ImageOff className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-all">{props.alt || 'Image failed to load'}</span>
      </span>
    );
  }

  return (
    <a href={props.url} target="_blank" rel="noopener noreferrer" className="my-1 block">
      <img
        src={props.url}
        alt={props.alt}
        loading="lazy"
        onError={() => setHasFailed(true)}
        className="max-h-80 max-w-full rounded-lg border border-border object-contain"
      />
    </a>
  );
}

function InlineText(props) {
  const parts = parseInline(props.text);

  return parts.map((part, index) => {
    if (part.type === 'code') {
      return (
        <code
          key={index}
          className={cn(
            'rounded px-1 py-px font-mono text-[0.85em]',
            props.isOwn && 'bg-white/20 text-white',
            !props.isOwn && 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
          )}
        >
          {part.text}
        </code>
      );
    }

    if (part.type === 'image') {
      return <MessageImage key={index} url={part.url} alt={part.alt} />;
    }

    if (part.type === 'link') {
      return (
        <a
          key={index}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('break-all underline underline-offset-2', props.isOwn && 'text-white', !props.isOwn && 'text-primary dark:text-brand-300')}
        >
          {part.text}
        </a>
      );
    }

    if (part.type === 'bold') {
      return (
        <strong key={index} className="font-bold">
          {part.text}
        </strong>
      );
    }

    return <Fragment key={index}>{part.text}</Fragment>;
  });
}

/**
 * Menampilkan isi pesan. Pesan dari AI dirender sebagai markdown sederhana
 * (daftar, blok kode, kode inline, teks tebal). Pesan biasa ditampilkan apa adanya.
 */
export default function MessageContent(props) {
  if (!props.renderMarkdown) {
    return <p className="whitespace-pre-wrap break-words">{props.text}</p>;
  }

  const blocks = parseMarkdown(props.text);

  return (
    <div className="space-y-1.5 break-words">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return <CodeBlock key={index} language={block.language} code={block.code} />;
        }

        if (block.type === 'table') {
          return (
            <div key={index} className="my-2 max-w-full overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {block.header.map((cell, cellIndex) => (
                      <th key={cellIndex} className="border-b border-border px-3 py-1.5 font-semibold">
                        <InlineText text={cell} isOwn={props.isOwn} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-border last:border-0">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-1.5 align-top">
                          <InlineText text={cell} isOwn={props.isOwn} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'heading') {
          return (
            <h3 key={index} className="pt-1 text-sm font-semibold text-foreground">
              <InlineText text={block.text} isOwn={props.isOwn} />
            </h3>
          );
        }

        if (block.type === 'list') {
          let ListTag = 'ul';
          if (block.ordered) {
            ListTag = 'ol';
          }

          return (
            <ListTag
              key={index}
              className={cn('space-y-0.5 pl-5', block.ordered && 'list-decimal', !block.ordered && 'list-disc')}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-0.5">
                  <InlineText text={item} isOwn={props.isOwn} />
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            <InlineText text={block.text} isOwn={props.isOwn} />
          </p>
        );
      })}
    </div>
  );
}

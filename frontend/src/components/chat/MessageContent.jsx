import { Fragment } from 'react';
import { cn } from '../../lib/cn';
import { parseInline, parseMarkdown } from '../../utils/markdown';
import CodeBlock from './CodeBlock';

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

        if (block.type === 'heading') {
          return (
            <h3 key={index} className="pt-1 text-sm font-semibold text-ink">
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

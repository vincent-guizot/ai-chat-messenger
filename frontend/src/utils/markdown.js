/**
 * Parser markdown sederhana untuk balasan AI.
 *
 * Yang didukung:
 *   - blok kode     ```js ... ```
 *   - judul         # Judul
 *   - daftar        1. item   /   - item
 *   - paragraf
 *   - inline        `kode`  dan  **tebal**
 *
 * Hasilnya berupa data (bukan HTML), lalu dirender oleh components/chat/MessageContent.jsx.
 * Dengan begitu tidak ada HTML dari server yang dirender langsung (aman dari XSS).
 */

const CODE_FENCE = '```';
const ORDERED_ITEM_PATTERN = /^\s*\d+[.)]\s+(.*)$/;
const UNORDERED_ITEM_PATTERN = /^\s*[-*•]\s+(.*)$/;
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;

export function parseMarkdown(text) {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraphLines = [];
  let index = 0;

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
      paragraphLines = [];
    }
  }

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    // Blok kode
    if (trimmedLine.startsWith(CODE_FENCE)) {
      flushParagraph();

      const language = trimmedLine.slice(CODE_FENCE.length).trim();
      const codeLines = [];
      index = index + 1;

      while (index < lines.length && !lines[index].trim().startsWith(CODE_FENCE)) {
        codeLines.push(lines[index]);
        index = index + 1;
      }

      blocks.push({ type: 'code', language: language, code: codeLines.join('\n') });
      index = index + 1;
      continue;
    }

    // Baris kosong memisahkan paragraf
    if (trimmedLine === '') {
      flushParagraph();
      index = index + 1;
      continue;
    }

    // Judul
    const headingMatch = trimmedLine.match(HEADING_PATTERN);
    if (headingMatch) {
      flushParagraph();
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      index = index + 1;
      continue;
    }

    // Daftar bernomor / daftar biasa
    const isOrdered = ORDERED_ITEM_PATTERN.test(line);
    const isUnordered = UNORDERED_ITEM_PATTERN.test(line);

    if (isOrdered || isUnordered) {
      flushParagraph();

      let pattern = UNORDERED_ITEM_PATTERN;
      if (isOrdered) {
        pattern = ORDERED_ITEM_PATTERN;
      }

      const items = [];

      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].match(pattern)[1]);
        index = index + 1;
      }

      blocks.push({ type: 'list', ordered: isOrdered, items: items });
      continue;
    }

    paragraphLines.push(line);
    index = index + 1;
  }

  flushParagraph();

  return blocks;
}

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

/**
 * Memecah satu baris teks menjadi potongan: text, code, atau bold.
 */
export function parseInline(text) {
  const parts = text.split(INLINE_PATTERN).filter((part) => part !== '');

  return parts.map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return { type: 'code', text: part.slice(1, -1) };
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return { type: 'bold', text: part.slice(2, -2) };
    }

    return { type: 'text', text: part };
  });
}

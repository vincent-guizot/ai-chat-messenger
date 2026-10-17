/**
 * Parser markdown sederhana untuk balasan AI.
 *
 * Yang didukung:
 *   - blok kode     ```js ... ```
 *   - judul         # Judul
 *   - daftar        1. item   /   - item
 *   - paragraf
 *   - tabel         | a | b |  (dengan baris pemisah |---|---|)
 *   - inline        `kode`, **tebal**, [teks](url), ![alt](url), dan URL polos
 *
 * Hanya URL http(s) yang dirender sebagai tautan / gambar.
 *
 * Hasilnya berupa data (bukan HTML), lalu dirender oleh components/chat/MessageContent.jsx.
 * Dengan begitu tidak ada HTML dari server yang dirender langsung (aman dari XSS).
 */

const CODE_FENCE = '```';
const ORDERED_ITEM_PATTERN = /^\s*\d+[.)]\s+(.*)$/;
const UNORDERED_ITEM_PATTERN = /^\s*[-*•]\s+(.*)$/;
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;

const TABLE_ROW_PATTERN = /^\s*\|.*\|\s*$/;
const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

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

    // Tabel: baris header, baris pemisah (|---|---|), lalu baris data.
    if (TABLE_ROW_PATTERN.test(line) && index + 1 < lines.length && TABLE_SEPARATOR_PATTERN.test(lines[index + 1])) {
      flushParagraph();

      const header = splitTableRow(line);
      const rows = [];
      index = index + 2;

      while (index < lines.length && TABLE_ROW_PATTERN.test(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index = index + 1;
      }

      blocks.push({ type: 'table', header: header, rows: rows });
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

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|!\[[^\]]*\]\([^)\s]+\)|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<>()]+)/g;
const IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const SAFE_URL_PATTERN = /^https?:\/\//i;

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

    const imageMatch = part.match(IMAGE_PATTERN);
    if (imageMatch && SAFE_URL_PATTERN.test(imageMatch[2])) {
      return { type: 'image', alt: imageMatch[1], url: imageMatch[2] };
    }

    const linkMatch = part.match(LINK_PATTERN);
    if (linkMatch && SAFE_URL_PATTERN.test(linkMatch[2])) {
      return { type: 'link', text: linkMatch[1], url: linkMatch[2] };
    }

    if (SAFE_URL_PATTERN.test(part)) {
      return { type: 'link', text: part, url: part };
    }

    return { type: 'text', text: part };
  });
}

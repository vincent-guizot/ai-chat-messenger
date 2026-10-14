/**
 * Pewarnaan sintaks yang sangat sederhana (tanpa library) untuk blok kode.
 * Memecah kode menjadi token: comment, string, keyword, number, function, atau text.
 * Class warnanya didefinisikan di styles/index.css (.code-token-*).
 */

const KEYWORDS = [
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'async', 'await', 'class', 'new', 'extends', 'static',
  'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined', 'this',
  'def', 'print', 'in', 'of', 'require', 'module', 'exports',
];

const TOKEN_PATTERN = new RegExp(
  [
    '(\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 1: comment
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)', // 2: string
    `\\b(${KEYWORDS.join('|')})\\b`, // 3: keyword
    '\\b(\\d+(?:\\.\\d+)?)\\b', // 4: number
    '\\b([A-Za-z_$][\\w$]*)(?=\\s*\\()', // 5: function call
  ].join('|'),
  'g',
);

const GROUP_TYPES = ['comment', 'string', 'keyword', 'number', 'function'];

export function highlightCode(code) {
  const tokens = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: code.slice(lastIndex, match.index) });
    }

    let tokenType = 'text';
    for (let groupIndex = 0; groupIndex < GROUP_TYPES.length; groupIndex = groupIndex + 1) {
      if (match[groupIndex + 1] !== undefined) {
        tokenType = GROUP_TYPES[groupIndex];
        break;
      }
    }

    tokens.push({ type: tokenType, text: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'text', text: code.slice(lastIndex) });
  }

  return tokens;
}

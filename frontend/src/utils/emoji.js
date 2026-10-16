/**
 * Alat bantu emoji untuk kotak input & gelembung pesan.
 */

// Emoticon teks yang otomatis diganti emoji saat pesan dikirim (hanya jika berdiri sendiri,
// diapit spasi / awal / akhir teks, supaya "http://" atau kode tidak ikut berubah).
const TEXT_EMOTICONS = [
  { text: ':)', emoji: '🙂' },
  { text: ':-)', emoji: '🙂' },
  { text: ':D', emoji: '😄' },
  { text: ':-D', emoji: '😄' },
  { text: ':(', emoji: '🙁' },
  { text: ':-(', emoji: '🙁' },
  { text: ';)', emoji: '😉' },
  { text: ':P', emoji: '😛' },
  { text: ':p', emoji: '😛' },
  { text: ':O', emoji: '😮' },
  { text: ':o', emoji: '😮' },
  { text: ":'(", emoji: '😢' },
  { text: 'XD', emoji: '😆' },
  { text: 'xD', emoji: '😆' },
  { text: '<3', emoji: '❤️' },
  { text: '</3', emoji: '💔' },
  { text: ':*', emoji: '😘' },
  { text: 'B)', emoji: '😎' },
  { text: ':|', emoji: '😐' },
  { text: ':/', emoji: '😕' },
  { text: '-_-', emoji: '😑' },
  { text: '^^', emoji: '😊' },
  { text: ':+1:', emoji: '👍' },
  { text: ':-1:', emoji: '👎' },
  { text: ':fire:', emoji: '🔥' },
  { text: ':ok:', emoji: '👌' },
  { text: ':wave:', emoji: '👋' },
  { text: ':clap:', emoji: '👏' },
  { text: ':pray:', emoji: '🙏' },
  { text: ':100:', emoji: '💯' },
  { text: ':tada:', emoji: '🎉' },
  { text: ':thinking:', emoji: '🤔' },
  { text: ':joy:', emoji: '😂' },
  { text: ':cry:', emoji: '😭' },
  { text: ':heart:', emoji: '❤️' },
  { text: ':eyes:', emoji: '👀' },
  { text: ':rocket:', emoji: '🚀' },
  { text: ':check:', emoji: '✅' },
];

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Satu regex untuk semua emoticon: (awal|spasi)(emoticon)(spasi|akhir). Emoticon terpanjang dicek lebih dulu.
const EMOTICON_PATTERN = TEXT_EMOTICONS.map((item) => escapeRegExp(item.text))
  .sort((first, second) => second.length - first.length)
  .join('|');

const EMOTICON_REGEX = new RegExp(`(^|\\s)(${EMOTICON_PATTERN})(?=\\s|$)`, 'g');

const EMOJI_BY_TEXT = {};
for (const item of TEXT_EMOTICONS) {
  EMOJI_BY_TEXT[item.text] = item.emoji;
}

/**
 * ":) semangat <3" -> "🙂 semangat ❤️"
 */
export function convertTextEmoticons(text) {
  if (!text) {
    return text;
  }

  return text.replace(EMOTICON_REGEX, (match, leadingSpace, emoticon) => {
    return leadingSpace + EMOJI_BY_TEXT[emoticon];
  });
}

// Karakter emoji (termasuk variation selector, ZWJ, dan skin tone) atau spasi.
const EMOJI_ONLY_REGEX = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|️|‍|\s)+$/u;

/**
 * Menghitung jumlah emoji dalam teks yang hanya berisi emoji.
 * Mengembalikan 0 jika teks kosong atau mengandung huruf/angka/karakter lain.
 */
export function countEmojiOnly(text) {
  if (!text) {
    return 0;
  }

  const trimmed = text.trim();

  if (trimmed === '' || !EMOJI_ONLY_REGEX.test(trimmed)) {
    return 0;
  }

  // Intl.Segmenter menghitung per grafem, sehingga "👨‍👩‍👧" (ZWJ) tetap dihitung satu.
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    let count = 0;

    for (const segment of segmenter.segment(trimmed.replace(/\s+/g, ''))) {
      if (segment.segment.trim() !== '') {
        count = count + 1;
      }
    }

    return count;
  }

  return Array.from(trimmed.replace(/\s+/g, '')).length;
}

/**
 * Menyisipkan teks (emoji) pada posisi kursor sebuah textarea.
 * Mengembalikan { value, cursor } untuk dipakai memperbarui state & posisi kursor.
 */
export function insertAtCursor(currentValue, textarea, insertedText) {
  let start = currentValue.length;
  let end = currentValue.length;

  if (textarea) {
    start = textarea.selectionStart;
    end = textarea.selectionEnd;
  }

  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);

  return {
    value: before + insertedText + after,
    cursor: start + insertedText.length,
  };
}

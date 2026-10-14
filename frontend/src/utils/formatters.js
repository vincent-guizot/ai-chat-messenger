const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * "Budi Santoso" -> "BS", nama kosong -> fallback.
 */
export function getInitials(name, fallback) {
  if (!name || name.trim() === '') {
    return fallback;
  }

  const words = name.trim().split(/\s+/).slice(0, 2);
  const firstLetters = words.map((word) => word.charAt(0));

  return firstLetters.join('').toUpperCase();
}

/**
 * "vincent@mail.com" -> "@vincent"
 */
export function getHandle(email) {
  if (!email) {
    return '';
  }

  return `@${email.split('@')[0]}`;
}

export function formatTime(dateValue) {
  let date = new Date();

  if (dateValue) {
    date = new Date(dateValue);
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Teks status untuk user offline, contoh: "Last seen 10m ago".
 */
export function formatLastSeen(lastSeenAt) {
  if (!lastSeenAt) {
    return 'Offline';
  }

  const elapsedMs = Date.now() - new Date(lastSeenAt).getTime();

  if (elapsedMs < MINUTE_MS) {
    return 'Last seen just now';
  }

  if (elapsedMs < HOUR_MS) {
    return `Last seen ${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }

  if (elapsedMs < DAY_MS) {
    return `Last seen ${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  }

  return `Last seen ${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

const AVATAR_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-violet-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-sky-600',
];

/**
 * Warna avatar yang selalu sama untuk teks yang sama (mis. id atau nama user).
 */
export function getAvatarGradient(seedText) {
  const text = seedText || '';
  let total = 0;

  for (let index = 0; index < text.length; index = index + 1) {
    total = total + text.charCodeAt(index);
  }

  return AVATAR_GRADIENTS[total % AVATAR_GRADIENTS.length];
}

/**
 * Memotong teks panjang untuk pratinjau pesan di sidebar.
 */
export function truncate(text, maxLength) {
  if (!text) {
    return '';
  }

  const singleLine = text.replace(/\s+/g, ' ').trim();

  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  return `${singleLine.slice(0, maxLength - 1)}…`;
}

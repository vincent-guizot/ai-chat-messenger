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
 * Label pemisah tanggal di daftar pesan: "Today", "Yesterday", atau tanggal lengkap.
 */
export function formatDayLabel(dateValue) {
  const date = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
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

// Warna solid avatar: variasi biru & navy, ditambah beberapa warna aksen yang lembut.
const AVATAR_COLORS = [
  'bg-brand-600',
  'bg-navy-600',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
];

/**
 * Warna avatar yang selalu sama untuk teks yang sama (mis. nama user).
 */
export function getAvatarColor(seedText) {
  const text = seedText || '';
  let total = 0;

  for (let index = 0; index < text.length; index = index + 1) {
    total = total + text.charCodeAt(index);
  }

  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

/**
 * Waktu relatif singkat untuk notifikasi, contoh: "just now", "5m", "2h", "3d".
 */
export function formatRelativeTime(dateValue) {
  const elapsedMs = Date.now() - new Date(dateValue).getTime();

  if (elapsedMs < MINUTE_MS) {
    return 'just now';
  }

  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }

  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  }

  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
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

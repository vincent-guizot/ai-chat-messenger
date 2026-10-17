/**
 * DATA CONTOH untuk desain halaman Group Chats, Group Details, dan Member Details.
 * Backend belum punya API grup; saat API siap, ganti isi file ini dengan hook/query
 * (bentuk datanya sengaja dibuat mirip dengan data percakapan yang sudah ada).
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(ms) {
  return new Date(Date.now() - ms).toISOString();
}

export const GROUP_ROLES = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

// Orang-orang di grup. id yang sama dengan id kontak asli akan memakai status online asli.
export const PEOPLE = [
  { id: 'u2', name: 'Budi Santoso', email: 'budi@mail.com', title: 'Product Designer', location: 'Jakarta', bio: 'Suka merapikan hal-hal berantakan. Kopi dulu, baru kerja.', online: true, joinedAt: ago(220 * DAY) },
  { id: 'u3', name: 'Citra Lestari', email: 'citra@mail.com', title: 'Frontend Engineer', location: 'Bandung', bio: 'React, animasi, dan sedikit obsesi pada pixel yang rapi.', online: false, lastSeenAt: ago(35 * MINUTE), joinedAt: ago(180 * DAY) },
  { id: 'u4', name: 'Dewi Anggraini', email: 'dewi@mail.com', title: 'Project Manager', location: 'Surabaya', bio: 'Memastikan semua deadline terasa masuk akal.', online: true, joinedAt: ago(140 * DAY) },
  { id: 'u5', name: 'Eko Prasetyo', email: 'eko@mail.com', title: 'Backend Engineer', location: 'Yogyakarta', bio: 'Node.js, database, dan tidur cukup.', online: false, lastSeenAt: ago(10 * HOUR), joinedAt: ago(90 * DAY) },
  { id: 'u6', name: 'Farah Nabila', email: 'farah@mail.com', title: 'QA Engineer', location: 'Jakarta', bio: 'Menemukan bug sebelum pengguna menemukannya.', online: true, joinedAt: ago(60 * DAY) },
  { id: 'u7', name: 'Gilang Ramadhan', email: 'gilang@mail.com', title: 'DevOps Engineer', location: 'Malang', bio: 'Deploy hari Jumat? Tentu saja tidak.', online: false, lastSeenAt: ago(2 * DAY), joinedAt: ago(45 * DAY) },
];

export const GROUPS = [
  {
    id: 'g1',
    name: 'Chibi Dev Team',
    description: 'Ruang diskusi harian tim pengembang Chibi Room: rilis, bug, dan ide fitur baru.',
    privacy: 'private',
    createdAt: ago(240 * DAY),
    unread: 3,
    muted: false,
    pinned: 'Rilis v1.4 dijadwalkan Jumat jam 16.00. Mohon semua PR di-merge sebelum Kamis malam.',
    members: [
      { id: 'me', role: 'owner' },
      { id: 'u2', role: 'admin' },
      { id: 'u3', role: 'member' },
      { id: 'u5', role: 'member' },
      { id: 'u6', role: 'member' },
      { id: 'u7', role: 'member' },
    ],
    media: { photos: 24, files: 12, links: 31 },
    messages: [
      { id: 'gm1', senderId: 'u4', content: 'Selamat pagi semua! Stand-up jam 10 ya.', createdAt: ago(5 * HOUR + 20 * MINUTE) },
      { id: 'gm2', senderId: 'u3', content: 'Siap. Halaman profil sudah aku push ke branch `feat/member-details`.', createdAt: ago(5 * HOUR) },
      { id: 'gm3', senderId: 'u3', content: 'Tinggal menunggu review dari Budi.', createdAt: ago(4 * HOUR + 58 * MINUTE) },
      { id: 'gm4', senderId: 'me', content: 'Mantap, nanti siang aku cek juga.', createdAt: ago(4 * HOUR + 30 * MINUTE) },
      { id: 'gm5', senderId: 'u2', content: 'Review selesai. Ada dua catatan kecil soal spacing di mobile, sisanya aman 👍', createdAt: ago(2 * HOUR) },
      { id: 'gm6', senderId: 'u6', content: 'Aku sudah tes di Android dan iOS. Semua halaman tampil rapi, kecuali sidebar yang agak mepet di layar 320px.', createdAt: ago(40 * MINUTE) },
      { id: 'gm7', senderId: 'u5', content: 'Endpoint grup sudah siap di staging. Dokumentasinya menyusul sore ini.', createdAt: ago(12 * MINUTE) },
    ],
  },
  {
    id: 'g2',
    name: 'Desain & UX',
    description: 'Berbagi referensi, review desain, dan diskusi design system Chibi Room.',
    privacy: 'private',
    createdAt: ago(200 * DAY),
    unread: 0,
    muted: false,
    pinned: '',
    members: [
      { id: 'u2', role: 'owner' },
      { id: 'me', role: 'admin' },
      { id: 'u3', role: 'member' },
      { id: 'u4', role: 'member' },
    ],
    media: { photos: 58, files: 7, links: 19 },
    messages: [
      { id: 'dm1', senderId: 'u2', content: 'Palet warna baru sudah diupdate di Figma.', createdAt: ago(2 * DAY) },
      { id: 'dm2', senderId: 'me', content: 'Keren, kontras di dark mode jadi jauh lebih nyaman.', createdAt: ago(2 * DAY - 20 * MINUTE) },
    ],
  },
  {
    id: 'g3',
    name: 'Futsal Jumat Malam',
    description: 'Atur jadwal, lapangan, dan patungan futsal mingguan.',
    privacy: 'public',
    createdAt: ago(120 * DAY),
    unread: 12,
    muted: true,
    pinned: 'Lapangan: GOR Senayan, Jumat 20.00. Patungan Rp 40.000/orang.',
    members: [
      { id: 'u7', role: 'owner' },
      { id: 'me', role: 'member' },
      { id: 'u5', role: 'member' },
      { id: 'u6', role: 'member' },
      { id: 'u4', role: 'member' },
    ],
    media: { photos: 41, files: 1, links: 3 },
    messages: [
      { id: 'fm1', senderId: 'u7', content: 'Jumat ini jadi ya? Butuh minimal 10 orang.', createdAt: ago(3 * HOUR) },
      { id: 'fm2', senderId: 'u5', content: 'Jadi! 🔥', createdAt: ago(2 * HOUR) },
    ],
  },
  {
    id: 'g4',
    name: 'Belajar Bareng',
    description: 'Kelompok belajar React, Node.js, dan sistem desain tiap Rabu.',
    privacy: 'public',
    createdAt: ago(60 * DAY),
    unread: 0,
    muted: false,
    pinned: '',
    members: [
      { id: 'u4', role: 'owner' },
      { id: 'me', role: 'member' },
      { id: 'u3', role: 'member' },
    ],
    media: { photos: 5, files: 22, links: 40 },
    messages: [{ id: 'bm1', senderId: 'u4', content: 'Materi minggu ini: state management dengan Zustand.', createdAt: ago(5 * DAY) }],
  },
];

export const SHARED_MEDIA_TONES = ['bg-brand-200', 'bg-sky-200', 'bg-emerald-200', 'bg-amber-200', 'bg-rose-200', 'bg-brand-300'];

export function findGroup(groupId) {
  return GROUPS.find((group) => group.id === groupId) || null;
}

/**
 * Menggabungkan data contoh dengan user asli: kontak asli (mis. status online) menang,
 * dan id "me" diganti dengan user yang sedang login.
 */
export function resolvePerson(personId, contactsById, currentUser) {
  if (personId === 'me') {
    const name = (currentUser && currentUser.name) || 'You';

    return {
      id: 'me',
      name: name,
      email: (currentUser && currentUser.email) || '',
      title: 'You',
      location: '',
      bio: 'Ini profil kamu.',
      online: true,
      isMe: true,
      joinedAt: ago(240 * DAY),
    };
  }

  const sample = PEOPLE.find((person) => person.id === personId);
  const live = contactsById[personId];

  if (live && sample) {
    return { ...sample, ...live };
  }

  if (live) {
    return { title: 'Member', location: '', bio: '', joinedAt: live.createdAt, ...live };
  }

  return sample || null;
}

export function getGroupsOfPerson(personId) {
  return GROUPS.filter((group) => group.members.some((member) => member.id === personId));
}

import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || '';

let socketUrl = '/';
if (API_BASE) {
  socketUrl = API_BASE;
}

/**
 * Satu koneksi Socket.IO untuk seluruh aplikasi.
 * Koneksi dibuka secara manual setelah user login (autoConnect: false).
 */
const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket'],
});

export default socket;

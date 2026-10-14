import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_BASE || '';
const socket = io(URL || '/', { autoConnect: false });

export default socket;

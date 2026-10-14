import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default io(API_BASE || "/", {
  autoConnect: false,
  transports: ["websocket"],
});

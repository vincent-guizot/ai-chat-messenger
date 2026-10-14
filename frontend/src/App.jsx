import React from "react";
import { useAuthStore } from "./stores/auth";
import Login from "./views/Login";
import ChatView from "./views/ChatView";

export default function App() {
  const { token } = useAuthStore();
  return token ? <ChatView /> : <Login />;
}

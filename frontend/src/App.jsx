import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <ChatPage />;
  }

  return <LoginPage />;
}

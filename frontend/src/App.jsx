import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useUiStore } from './stores/uiStore';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

/**
 * Menerapkan tema (terang/gelap) dengan menambah/menghapus class "dark" di <html>.
 * Berlaku untuk semua halaman, termasuk login.
 */
function useApplyTheme() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const rootElement = document.documentElement;

    if (theme === 'dark') {
      rootElement.classList.add('dark');
    } else {
      rootElement.classList.remove('dark');
    }
  }, [theme]);
}

export default function App() {
  const token = useAuthStore((state) => state.token);

  useApplyTheme();

  if (token) {
    return <ChatPage />;
  }

  return <LoginPage />;
}

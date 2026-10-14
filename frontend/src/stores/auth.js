import { create } from 'zustand';

const STORAGE_KEY = 'ai_chat_auth';

function readPersistedAuth() {
  if (typeof window === 'undefined') return { token: null, user: null };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };

    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token || null,
      user: parsed?.user || null,
    };
  } catch (error) {
    return { token: null, user: null };
  }
}

export const useAuthStore = create((set) => {
  const initial = readPersistedAuth();

  return {
    token: initial.token,
    user: initial.user,
    setAuth: (token, user) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
      }
      set({ token, user });
    },
    clearAuth: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ token: null, user: null });
    },
  };
});

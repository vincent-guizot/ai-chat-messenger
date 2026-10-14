import { create } from 'zustand';

const STORAGE_KEY = 'ai_chat_auth';

const EMPTY_AUTH = {
  token: null,
  user: null,
};

function readSavedAuth() {
  try {
    const savedText = window.localStorage.getItem(STORAGE_KEY);

    if (!savedText) {
      return EMPTY_AUTH;
    }

    const saved = JSON.parse(savedText);

    return {
      token: saved.token || null,
      user: saved.user || null,
    };
  } catch (error) {
    return EMPTY_AUTH;
  }
}

function saveAuth(token, user) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token, user: user }));
  } catch (error) {
    // localStorage bisa tidak tersedia (mis. mode private). Login tetap berjalan di memori.
  }
}

function removeSavedAuth() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Abaikan, lihat catatan pada saveAuth.
  }
}

export const useAuthStore = create((set) => {
  const savedAuth = readSavedAuth();

  return {
    token: savedAuth.token,
    user: savedAuth.user,

    setAuth: (token, user) => {
      saveAuth(token, user);
      set({ token: token, user: user });
    },

    clearAuth: () => {
      removeSavedAuth();
      set(EMPTY_AUTH);
    },
  };
});

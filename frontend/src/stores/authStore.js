import { create } from 'zustand';

const STORAGE_KEY = 'ai_chat_auth';

const EMPTY_AUTH = {
  token: null,
  user: null,
};

/**
 * "Remember me" aktif  -> disimpan di localStorage (tetap login setelah browser ditutup).
 * "Remember me" mati   -> disimpan di sessionStorage (hilang saat tab ditutup).
 */
function getStorage(remember) {
  if (remember) {
    return window.localStorage;
  }

  return window.sessionStorage;
}

function readSavedAuthFrom(storage) {
  try {
    const savedText = storage.getItem(STORAGE_KEY);

    if (!savedText) {
      return null;
    }

    const saved = JSON.parse(savedText);

    if (!saved.token) {
      return null;
    }

    return {
      token: saved.token,
      user: saved.user || null,
    };
  } catch (error) {
    return null;
  }
}

function readSavedAuth() {
  const rememberedAuth = readSavedAuthFrom(getStorage(true));

  if (rememberedAuth) {
    return rememberedAuth;
  }

  const sessionAuth = readSavedAuthFrom(getStorage(false));

  if (sessionAuth) {
    return sessionAuth;
  }

  return EMPTY_AUTH;
}

function saveAuth(token, user, remember) {
  try {
    getStorage(remember).setItem(STORAGE_KEY, JSON.stringify({ token: token, user: user }));
  } catch (error) {
    // Storage bisa tidak tersedia (mis. mode private). Login tetap berjalan di memori.
  }
}

function removeSavedAuth() {
  try {
    getStorage(true).removeItem(STORAGE_KEY);
    getStorage(false).removeItem(STORAGE_KEY);
  } catch (error) {
    // Abaikan, lihat catatan pada saveAuth.
  }
}

export const useAuthStore = create((set) => {
  const savedAuth = readSavedAuth();

  return {
    token: savedAuth.token,
    user: savedAuth.user,

    setAuth: (token, user, remember) => {
      removeSavedAuth();
      saveAuth(token, user, remember);
      set({ token: token, user: user });
    },

    clearAuth: () => {
      removeSavedAuth();
      set(EMPTY_AUTH);
    },
  };
});

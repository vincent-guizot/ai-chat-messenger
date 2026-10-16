import { create } from 'zustand';

const THEME_STORAGE_KEY = 'ai_chat_theme';

export const SIDEBAR_TABS = {
  assistant: 'assistant',
  direct: 'direct',
  contacts: 'contacts',
};

function readSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  } catch (error) {
    // localStorage tidak tersedia, pakai tema terang.
  }

  return 'light';
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Abaikan: tema tetap berlaku sampai halaman dimuat ulang.
  }
}

/**
 * State tampilan: tema, sidebar, dan tab yang aktif.
 */
export const useUiStore = create((set, get) => {
  return {
    theme: readSavedTheme(),
    isSidebarCollapsed: false,
    isMobileSidebarOpen: false,
    activeTab: SIDEBAR_TABS.assistant,

    toggleTheme: () => {
      let nextTheme = 'dark';
      if (get().theme === 'dark') {
        nextTheme = 'light';
      }

      saveTheme(nextTheme);
      set({ theme: nextTheme });
    },

    toggleSidebarCollapsed: () => {
      set({ isSidebarCollapsed: !get().isSidebarCollapsed });
    },

    setMobileSidebarOpen: (isOpen) => {
      set({ isMobileSidebarOpen: isOpen });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
  };
});

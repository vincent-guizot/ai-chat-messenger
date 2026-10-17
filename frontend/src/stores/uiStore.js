import { create } from 'zustand';

const THEME_STORAGE_KEY = 'ai_chat_theme';

export const SIDEBAR_TABS = {
  assistant: 'assistant',
  direct: 'direct',
  contacts: 'contacts',
  groups: 'groups',
};

/**
 * Halaman yang tampil di area utama (kartu kanan).
 *   chat           chat AI / pesan langsung (bawaan)
 *   groups         Group Chats: daftar grup
 *   group-chat     Group Chats: percakapan satu grup
 *   group-details  Group Details
 *   member-details Member Details
 */
export const VIEWS = {
  chat: 'chat',
  groups: 'groups',
  groupChat: 'group-chat',
  groupDetails: 'group-details',
  memberDetails: 'member-details',
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
    view: { name: VIEWS.chat, id: null },
    // Halaman sebelumnya, dipakai tombol "Back" di Group Details & Member Details.
    previousView: null,

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

    openView: (name, id) => {
      const current = get().view;
      set({ previousView: current, view: { name: name, id: id || null }, isMobileSidebarOpen: false });
    },

    goBack: () => {
      const previous = get().previousView;
      set({ view: previous || { name: VIEWS.chat, id: null }, previousView: null });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
  };
});

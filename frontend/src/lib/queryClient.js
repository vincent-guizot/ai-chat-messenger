import { QueryClient } from '@tanstack/react-query';

/**
 * React Query menyimpan data dari server (percakapan, kontak, pesan).
 * Data diperbarui secara real-time lewat socket (lihat hooks/useChatSocket.js),
 * jadi refetch otomatis saat jendela fokus tidak diperlukan.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

/**
 * Semua key React Query dikumpulkan di satu tempat agar tidak salah ketik.
 */
export const queryKeys = {
  conversations: ['conversations'],
  contacts: ['contacts'],
  messages: (conversationId) => ['messages', conversationId],
};

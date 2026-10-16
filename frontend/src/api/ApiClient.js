import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE || '';
// Backend di Render plan free "tidur" saat idle dan butuh 30-60 detik untuk bangun,
// jadi request pertama diberi waktu lebih lama.
const REQUEST_TIMEOUT_MS = 60000;

/**
 * Satu instance axios untuk seluruh request ke backend.
 *
 * - Header "Authorization: Bearer <token>" dipasang otomatis dari authStore.
 * - Backend selalu membalas { ok: boolean, error?: string, ... }; interceptor di bawah
 *   mengubah balasan gagal menjadi Error dengan pesan yang siap ditampilkan.
 * - Balasan 401 (token kedaluwarsa / tidak valid) langsung mengeluarkan user ke halaman login.
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Mengambil pesan error yang paling berguna dari sebuah error axios.
 */
function getErrorMessage(error) {
  const response = error.response;

  if (response && response.data && response.data.error) {
    return response.data.error;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  if (!response) {
    return 'Cannot reach the server. Check your connection.';
  }

  return error.message || 'Request failed';
}

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;

    if (data && data.ok === false) {
      return Promise.reject(new Error(data.error || 'Request failed'));
    }

    return response;
  },
  (error) => {
    const response = error.response;
    const hadToken = Boolean(useAuthStore.getState().token);

    if (response && response.status === 401 && hadToken) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(new Error(getErrorMessage(error)));
  },
);

/**
 * Pembungkus tipis agar pemanggil langsung mendapat body JSON (response.data).
 */
class ApiClient {
  static async get(path, config) {
    const response = await apiClient.get(path, config);
    return response.data;
  }

  static async post(path, body, config) {
    const response = await apiClient.post(path, body, config);
    return response.data;
  }

  static async patch(path, body, config) {
    const response = await apiClient.patch(path, body, config);
    return response.data;
  }

  static async delete(path, config) {
    const response = await apiClient.delete(path, config);
    return response.data;
  }
}

export { apiClient };
export default ApiClient;

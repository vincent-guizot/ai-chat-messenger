import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Pembungkus fetch untuk semua request ke backend.
 * Backend selalu membalas dengan format { ok: boolean, error?: string, ... }.
 */
class ApiClient {
  static async request(path, options) {
    const requestOptions = options || {};
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requestOptions.token) {
      headers.Authorization = `Bearer ${requestOptions.token}`;
    }

    const fetchOptions = {
      method: requestOptions.method || 'GET',
      headers: headers,
    };

    if (requestOptions.body !== undefined) {
      fetchOptions.body = JSON.stringify(requestOptions.body);
    }

    const response = await fetch(`${API_BASE}${path}`, fetchOptions);

    // Token kedaluwarsa / tidak valid -> keluarkan user ke halaman login.
    if (response.status === 401 && requestOptions.token) {
      useAuthStore.getState().clearAuth();
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  static get(path, token) {
    return ApiClient.request(path, { method: 'GET', token: token });
  }

  static post(path, body, token) {
    return ApiClient.request(path, { method: 'POST', body: body, token: token });
  }
}

export default ApiClient;

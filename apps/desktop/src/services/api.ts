import axios from 'axios';
import { getStorageItem, removeStorageItem, setStorageItem } from '../lib/storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await getStorageItem<string>('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Workspace Injection: se o usuário estiver na visão de um Grupo,
    // todos os requests para transações e relatórios ganham o group_id
    if (typeof window !== 'undefined') {
      const groupId = sessionStorage.getItem("seneb_active_group_id");
      if (groupId && groupId !== "personal") {
        const isTargetRoute = ["/transactions", "/reports", "/analytics"].some(
          (prefix) => config.url?.includes(prefix)
        );
        if (isTargetRoute) {
            if (config.method === "get") {
                config.params = { ...config.params, group_id: groupId };
            } else if (config.method === "post" || config.method === "put") {
                if (!config.data) config.data = {};
                config.data.group_id = groupId;
            }
        }
      }
    }

  } catch {
    // silently ignore token retrieval errors
  }
  return config;
});

let _isRefreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

async function _doLogout() {
  await removeStorageItem('token');
  await removeStorageItem('refresh_token');
  await removeStorageItem('user');
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh if the failing request is itself the refresh endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      if (_isRefreshing) {
        // Queue the request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          _refreshQueue.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
          setTimeout(() => reject(error), 10000);
        });
      }

      _isRefreshing = true;
      try {
        const storedRefreshToken = await getStorageItem<string>('refresh_token');

        if (!storedRefreshToken) {
          await _doLogout();
          return Promise.reject(error);
        }

        const { data } = await api.post('/auth/refresh', { refresh_token: storedRefreshToken });

        const newAccessToken: string = data.access_token;
        const newRefreshToken: string = data.refresh_token;

        // Persist the new tokens in whichever storage the old ones were in
        const inDisk = await getStorageItem<string>('remember_me');
        if (inDisk) {
          await setStorageItem('token', newAccessToken);
          if (newRefreshToken) await setStorageItem('refresh_token', newRefreshToken);
        } else {
          sessionStorage.setItem('token', newAccessToken);
          if (newRefreshToken) sessionStorage.setItem('refresh_token', newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Flush the queue
        _refreshQueue.forEach((cb) => cb(newAccessToken));
        _refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        _refreshQueue = [];
        await _doLogout();
        return Promise.reject(error);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

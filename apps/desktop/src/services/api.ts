import axios from 'axios';
import { getStorageItem, removeStorageItem } from '../lib/storage'; // Adicione removeStorageItem

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
        const isTargetRoute = config.url?.includes("/transactions") || config.url?.includes("/reports");
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
    
  } catch (error) {
    console.error("Erro ao obter token:", error);
  }
  return config;
});

// --- Interceptor de Resposta (NOVO: Auto-Logout) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o backend disser "Quem é você?" (401)
    if (error.response?.status === 401) {
      console.warn("🔒 Sessão expirada ou inválida. Realizando logout automático...");

      try {
        // 1. Limpa o token podre do disco/memória
        await removeStorageItem('token');
        await removeStorageItem('user');

        // 2. Força o redirecionamento para o login
        // Usamos window.location para garantir que estados antigos do React sejam zerados
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } catch (logoutError) {
        console.error("Erro crítico no auto-logout:", logoutError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
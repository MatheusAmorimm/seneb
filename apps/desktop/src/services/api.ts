import axios from 'axios';
import { getStorageItem, removeStorageItem } from '../lib/storage'; // Adicione removeStorageItem

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de Requisição (Mantido) ---
api.interceptors.request.use(async (config) => {
  try {
    const token = await getStorageItem<string>('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
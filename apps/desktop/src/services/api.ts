import axios from 'axios';
import { getStorageItem } from '../lib/storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de Requisição ---
// Antes de cada requisição sair, injetamos o token
api.interceptors.request.use(async (config) => {
  try {
    // Busca o token (seja do localStorage ou sessionStorage/tauri-store)
    const token = await getStorageItem<string>('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao obter token:", error);
  }
  return config;
});

// --- Interceptor de Resposta (Opcional, mas recomendado) ---
// Se der 401 (Token expirado/inválido), podemos limpar o storage ou redirecionar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada ou inválida.");
      // Aqui poderíamos forçar um logout no futuro
    }
    return Promise.reject(error);
  }
);

export default api;
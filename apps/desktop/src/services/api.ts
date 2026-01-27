import axios from 'axios';

const api = axios.create({
  // Tenta pegar do .env, se falhar usa o localhost como fallback de segurança
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
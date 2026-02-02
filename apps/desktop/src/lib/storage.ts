// 1. Usamos 'unknown' aqui também para agradar o linter
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

import { load } from '@tauri-apps/plugin-store';

const STORE_PATH = 'settings.json';

// 2. Criamos um tipo para definir o que é permitido salvar.
// Isso substitui o 'any' por algo concreto.
type StorageValue = string | number | boolean | object | null;

const isTauri = () => typeof window !== 'undefined' && window.hasOwnProperty('__TAURI_INTERNALS__');

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  // ... (código existente da RAM)
  if (typeof window !== 'undefined') {
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) {
      try { return JSON.parse(sessionValue); } catch { return sessionValue as unknown as T; }
    }
  }
  // ... (código existente do Disco)
  if (isTauri()) {
    try {
      const store = await load(STORE_PATH);
      const value = await store.get<T>(key);
      return value || null;
    } catch { return null; }
  }
  return null;
};

export const setStorageItem = async (key: string, value: StorageValue): Promise<void> => {
  if (isTauri()) {
    const store = await load(STORE_PATH);
    await store.set(key, value);
    await store.save();
  }
};

// --- CORREÇÃO AQUI ---

// Função de Logout Geral (Limpa TUDO)
export const removeStorageItem = async (key: string): Promise<void> => {
  if (typeof window !== 'undefined') sessionStorage.removeItem(key); // Limpa RAM
  
  if (isTauri()) {
    const store = await load(STORE_PATH);
    await store.delete(key);
    await store.save(); // Limpa Disco
  }
};

// NOVA FUNÇÃO: Limpa SÓ o disco (para usar no Login temporário)
export const removeFromDiskOnly = async (key: string): Promise<void> => {
  if (isTauri()) {
    const store = await load(STORE_PATH);
    await store.delete(key);
    await store.save();
  }
  // Note que NÃO tocamos no sessionStorage aqui!
};
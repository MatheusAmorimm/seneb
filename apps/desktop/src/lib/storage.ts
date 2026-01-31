import { load } from '@tauri-apps/plugin-store';

type StorageValue = string | number | boolean | null | object;
const STORE_PATH = 'settings.json';

// Função auxiliar para verificar se estamos no ambiente Tauri
const isTauri = () => typeof window !== 'undefined' && window.hasOwnProperty('__TAURI_INTERNALS__');

export const setStorageItem = async (key: string, value: StorageValue): Promise<void> => {
  if (!isTauri()) return;
  const store = await load(STORE_PATH);
  await store.set(key, value);
  await store.save(); 
};

export const getStorageItem = async <T = StorageValue>(key: string): Promise<T | undefined> => {
  if (!isTauri()) return undefined;
  try {
    const store = await load(STORE_PATH);
    const value = await store.get<T>(key);
    return value ?? undefined;
  } catch (err) {
    console.error("Storage error:", err);
    return undefined;
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  if (!isTauri()) return;
  const store = await load(STORE_PATH);
  await store.delete(key);
  await store.save();
};
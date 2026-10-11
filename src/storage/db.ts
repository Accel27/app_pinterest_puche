import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  usuarios: '@pinterest/usuarios',
  pins: '@pinterest/pins',
  tableros: '@pinterest/tableros',
  comentarios: '@pinterest/comentarios',
  notificaciones: '@pinterest/notificaciones',
  configuracion: '@pinterest/configuracion',
  seedAplicado: '@pinterest/seedAplicado_v2',
} as const;

export async function leer<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function escribir<T>(key: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(valor));
}
import * as FileSystem from 'expo-file-system/legacy';

const DIR = (FileSystem.documentDirectory ?? '') + 'pins/';

export async function asegurarDirectorio(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

export async function copiarImagenAPins(origen: string, id: string): Promise<string> {
  await asegurarDirectorio();
  const destino = `${DIR}pin-${id}.jpg`;
  await FileSystem.copyAsync({ from: origen, to: destino });
  return destino;
}

export async function borrarImagen(uri: string): Promise<void> {
  if (!uri || uri.startsWith('seed:')) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // silencioso
  }
}
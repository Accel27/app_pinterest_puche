import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { Tema } from './tema';

export function useTema(): Tema {
  return useApp().tema;
}

// Uso en pantallas:
//   const estilos = useEstilos(crearEstilos);
//   function crearEstilos(tema: Tema) { return StyleSheet.create({...}); }
export function useEstilos<T extends StyleSheet.NamedStyles<T>>(
  fabrica: (tema: Tema) => T
): T {
  const tema = useTema();
  return useMemo(() => StyleSheet.create(fabrica(tema)), [tema, fabrica]);
}
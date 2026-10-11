export interface Tema {
  modo: 'claro' | 'oscuro';
  fondo: string;
  superficie: string;
  superficieAlt: string;
  texto: string;
  textoSuave: string;
  textoInverso: string;
  borde: string;
  primario: string;
  primarioSuave: string;
  peligro: string;
  exito: string;
}

export const COLORES_PRINCIPALES = [
  { id: 'rojo', nombre: 'Rojo', valor: '#E60023' },
  { id: 'morado', nombre: 'Morado', valor: '#7C3AED' },
  { id: 'azul', nombre: 'Azul', valor: '#2563EB' },
  { id: 'verde', nombre: 'Verde', valor: '#16A34A' },
  { id: 'naranja', nombre: 'Naranja', valor: '#EA580C' },
  { id: 'rosa', nombre: 'Rosa', valor: '#DB2777' },
  { id: 'teal', nombre: 'Teal', valor: '#0D9488' },
  { id: 'negro', nombre: 'Negro', valor: '#111111' },
] as const;

export function hexARgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function crearTema(modo: 'claro' | 'oscuro', primario: string): Tema {
  const esClaro = modo === 'claro';
  return {
    modo,
    fondo: esClaro ? '#FFFFFF' : '#121212',
    superficie: esClaro ? '#F5F5F5' : '#1E1E1E',
    superficieAlt: esClaro ? '#EBEBEB' : '#2A2A2A',
    texto: esClaro ? '#111111' : '#F5F5F5',
    textoSuave: esClaro ? '#666666' : '#AAAAAA',
    textoInverso: esClaro ? '#FFFFFF' : '#111111',
    borde: esClaro ? '#E0E0E0' : '#333333',
    primario,
    primarioSuave: hexARgba(primario, esClaro ? 0.12 : 0.22),
    peligro: '#DC2626',
    exito: '#16A34A',
  };
}
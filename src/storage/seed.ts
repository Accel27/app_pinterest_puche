import { Categoria, Pin } from '../types';

export const CATEGORIAS: Categoria[] = [
  'Arte',
  'Comida',
  'Viajes',
  'Moda',
  'Tecnologia',
  'Deporte',
  'Musica',
  'Naturaleza',
  'Anime',
  'Gaming',
];

// Etiquetas visibles al usuario (con acentos). Las keys son las mismas que
// el type Categoria para que funcione como map directo.
export const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  Arte: 'Arte',
  Comida: 'Comida',
  Viajes: 'Viajes',
  Moda: 'Moda',
  Tecnologia: 'Tecnología',
  Deporte: 'Deporte',
  Musica: 'Música',
  Naturaleza: 'Naturaleza',
  Anime: 'Anime',
  Gaming: 'Gaming',
};

// Requiere que existan los 8 archivos en assets/images/seed/
export const IMAGENES_SEED: Record<string, any> = {
  'seed:pin1': require('../../assets/images/seed/pin1.jpg'),
  'seed:pin2': require('../../assets/images/seed/pin2.jpg'),
  'seed:pin3': require('../../assets/images/seed/pin3.jpg'),
  'seed:pin4': require('../../assets/images/seed/pin4.jpg'),
  'seed:pin5': require('../../assets/images/seed/pin5.jpg'),
  'seed:pin6': require('../../assets/images/seed/pin6.jpg'),
  'seed:pin7': require('../../assets/images/seed/pin7.jpg'),
  'seed:pin8': require('../../assets/images/seed/pin8.jpg'),
};

// Convierte el string guardado en un source valido para <Image>
export function fuenteImagen(imagen: string): any {
  if (imagen.startsWith('seed:')) {
    return IMAGENES_SEED[imagen] ?? IMAGENES_SEED['seed:pin1'];
  }
  return { uri: imagen };
}

export function generarPinesSeed(): Pin[] {
  const ahora = Date.now();
  const datos: {
    titulo: string;
    descripcion: string;
    categoria: Categoria;
    imagen: string;
    aspectRatio: number;
  }[] = [
    { titulo: 'Retrato anime', descripcion: 'Ilustración de personaje anime', categoria: 'Anime', imagen: 'seed:pin1', aspectRatio: 0.6 },
    { titulo: 'Personaje violeta', descripcion: 'Fan art con detalles morados', categoria: 'Anime', imagen: 'seed:pin2', aspectRatio: 0.7 },
    { titulo: 'Playa al atardecer', descripcion: 'Vista del mar al atardecer', categoria: 'Viajes', imagen: 'seed:pin3', aspectRatio: 1.15 },
    { titulo: 'Outfit casual', descripcion: 'Combinación urbana de temporada', categoria: 'Moda', imagen: 'seed:pin4', aspectRatio: 0.75 },
    { titulo: 'Setup gamer', descripcion: 'Escritorio con luces LED', categoria: 'Gaming', imagen: 'seed:pin5', aspectRatio: 1.0 },
    { titulo: 'Build de personaje', descripcion: 'Stats y armas para el endgame', categoria: 'Gaming', imagen: 'seed:pin6', aspectRatio: 0.85 },
    { titulo: 'Concierto en vivo', descripcion: 'Banda tocando en un estadio', categoria: 'Musica', imagen: 'seed:pin7', aspectRatio: 1.1 },
    { titulo: 'Bosque nevado', descripcion: 'Paisaje natural con nieve', categoria: 'Naturaleza', imagen: 'seed:pin8', aspectRatio: 0.65 },
  ];

  return datos.map((d, i) => ({
    id: `seed-pin-${i + 1}`,
    titulo: d.titulo,
    descripcion: d.descripcion,
    imagen: d.imagen,
    esSeed: true,
    autorId: 'seed-sistema',
    categoria: d.categoria,
    tableroId: null,
    likes: [],
    creadoEn: ahora - (8 - i) * 1000,
    aspectRatio: d.aspectRatio,
  }));
}
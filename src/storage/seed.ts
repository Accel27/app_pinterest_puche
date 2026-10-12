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
    {
      titulo: 'Curadora de hardware',
      descripcion:
        'Mi gata supervisando que la CPU no se sobrecaliente. Nadie toca su trono.',
      categoria: 'Arte',
      imagen: 'seed:pin1',
      aspectRatio: 0.46,
    },
    {
      titulo: 'Pizza de vegetales',
      descripcion:
        'Con maíz, champiñones, pimentón y mucho queso. Recién salida del horno.',
      categoria: 'Comida',
      imagen: 'seed:pin2',
      aspectRatio: 0.66,
    },
    {
      titulo: 'Médanos de Coro',
      descripcion:
        'Venezuela también tiene desierto. Falcón esconde dunas doradas que parecen de otro planeta.',
      categoria: 'Viajes',
      imagen: 'seed:pin3',
      aspectRatio: 1.5,
    },
    {
      titulo: 'Accelerator',
      descripcion:
        'El esper más poderoso de Ciudad Academia. De "To Aru Majutsu no Index".',
      categoria: 'Anime',
      imagen: 'seed:pin4',
      aspectRatio: 1.17,
    },
    {
      titulo: 'Aventurera de Blue Protocol',
      descripcion:
        'Stats de mi personaje cuando jugaba Blue Protocol. Build de F2P, jugada al día, y aun así llegaba a contenido endgame.',
      categoria: 'Gaming',
      imagen: 'seed:pin5',
      aspectRatio: 1.78,
    },
    {
      titulo: 'Carlotta arrasando',
      descripcion:
        '332985 de daño con la ulti. La Torre de la Adversidad no vio venir esa.',
      categoria: 'Gaming',
      imagen: 'seed:pin6',
      aspectRatio: 1.91,
    },
    {
      titulo: 'Setup Razer',
      descripcion:
        'Luces RGB, triple monitor y silla gamer. El rendimiento se mide en fps, pero la estética en vatios de luz.',
      categoria: 'Tecnologia',
      imagen: 'seed:pin7',
      aspectRatio: 1.5,
    },
    {
      titulo: 'Hatsune Miku',
      descripcion:
        'La vocaloid más famosa del mundo, rodeada de pantallas y cables en este fan art.',
      categoria: 'Musica',
      imagen: 'seed:pin8',
      aspectRatio: 0.61,
    },
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
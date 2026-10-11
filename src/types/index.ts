export type ModoTema = 'claro' | 'oscuro' | 'sistema';

export type Categoria =
  | 'Arte'
  | 'Comida'
  | 'Viajes'
  | 'Moda'
  | 'Tecnologia'
  | 'Deporte'
  | 'Musica'
  | 'Naturaleza'
  | 'Anime'
  | 'Gaming';

export interface Usuario {
  id: string;
  nombreUsuario: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  fechaRegistro: number;
}

export interface Pin {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  esSeed: boolean;
  autorId: string;
  categoria: Categoria;
  tableroId: string | null;
  likes: string[];
  creadoEn: number;
  aspectRatio?: number;
}

export interface Tablero {
  id: string;
  nombre: string;
  autorId: string;
  creadoEn: number;
}

export interface Comentario {
  id: string;
  pinId: string;
  autorId: string;
  texto: string;
  creadoEn: number;
}

export type TipoNotificacion = 'like' | 'comentario' | 'guardado';

export interface Notificacion {
  id: string;
  usuarioDestinoId: string;
  tipo: TipoNotificacion;
  pinId: string;
  usuarioOrigenId: string;
  leida: boolean;
  creadoEn: number;
}

export interface Configuracion {
  modoTema: ModoTema;
  colorPrincipal: string;
  usuarioActualId: string | null;
}
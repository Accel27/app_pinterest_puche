import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import {
  Categoria,
  Comentario,
  Configuracion,
  Notificacion,
  Pin,
  Tablero,
  Usuario,
} from '../types';
import { Tema, crearTema } from '../theme/tema';
import { KEYS, escribir, leer } from '../storage/db';
import { generarId } from '../utils/id';
import { hashPassword } from '../utils/crypto';
import { borrarImagen, copiarAvatar, copiarImagenAPins } from '../storage/imagenes';
import { generarPinesSeed } from '../storage/seed';

const CONFIG_DEFAULT: Configuracion = {
  modoTema: 'sistema',
  colorPrincipal: '#E60023',
  usuarioActualId: null,
};

const COLOR_DEFAULT = '#E60023';

interface ResultadoAuth {
  ok: boolean;
  error?: string;
}

interface ContextoApp {
  cargando: boolean;
  usuarios: Usuario[];
  pins: Pin[];
  tableros: Tablero[];
  comentarios: Comentario[];
  notificaciones: Notificacion[];
  configuracion: Configuracion;
  usuarioActual: Usuario | null;
  tema: Tema;
  modoEfectivo: 'claro' | 'oscuro';

  registrar: (nombreUsuario: string, email: string, password: string) => Promise<ResultadoAuth>;
  login: (email: string, password: string) => Promise<ResultadoAuth>;
  logout: () => Promise<void>;

    crearPin: (datos: {
    titulo: string;
    descripcion: string;
    categoria: Categoria;
    tableroId: string | null;
    imagenTemporal: string;
    anchoImagen: number;
    altoImagen: number;
  }) => Promise<Pin | null>;
  eliminarPin: (pinId: string) => Promise<void>;
  toggleLike: (pinId: string) => Promise<void>;

  crearTablero: (nombre: string) => Promise<Tablero | null>;
  eliminarTablero: (tableroId: string) => Promise<void>;
  asignarPinATablero: (pinId: string, tableroId: string | null) => Promise<void>;

  agregarComentario: (pinId: string, texto: string) => Promise<void>;
  eliminarComentario: (comentarioId: string) => Promise<void>;

  marcarNotificacionesLeidas: () => Promise<void>;

  setModoTema: (modo: Configuracion['modoTema']) => Promise<void>;
  setColorPrincipal: (color: string) => Promise<void>;

  editarPerfil: (datos: {
  passwordActual: string;
  nombreUsuario?: string;
  avatarTempUri?: string | null;
  passwordNueva?: string;
  }) => Promise<ResultadoAuth>;
}

const Contexto = createContext<ContextoApp | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion>(CONFIG_DEFAULT);

  const sistemaScheme = useColorScheme();

  const modoEfectivo: 'claro' | 'oscuro' = useMemo(() => {
    if (configuracion.modoTema === 'sistema') {
      return sistemaScheme === 'dark' ? 'oscuro' : 'claro';
    }
    return configuracion.modoTema;
  }, [configuracion.modoTema, sistemaScheme]);

    const usuarioActual = useMemo(
    () => usuarios.find((u) => u.id === configuracion.usuarioActualId) ?? null,
    [usuarios, configuracion.usuarioActualId]
    );
    
  // El color del tema sale del usuario actual si hay sesion.
  // Si no hay usuario (Login/Register), usa el global.
  const colorEfectivo = usuarioActual?.colorPrincipal ?? configuracion.colorPrincipal;

  const tema = useMemo(
    () => crearTema(modoEfectivo, colorEfectivo),
    [modoEfectivo, colorEfectivo]
  );

  // Carga inicial (una sola vez)
  useEffect(() => {
    (async () => {
      const [u, p, t, c, n, cfg, seedAplicado] = await Promise.all([
        leer<Usuario[]>(KEYS.usuarios, []),
        leer<Pin[]>(KEYS.pins, []),
        leer<Tablero[]>(KEYS.tableros, []),
        leer<Comentario[]>(KEYS.comentarios, []),
        leer<Notificacion[]>(KEYS.notificaciones, []),
        leer<Configuracion>(KEYS.configuracion, CONFIG_DEFAULT),
        leer<boolean>(KEYS.seedAplicado, false),
      ]);

      let pinsFinales = p;
        if (!seedAplicado) {
        // Quitamos cualquier seed anterior antes de reinsertar los nuevos.
        // Esto evita duplicados cuando cambiamos la definicion del seed.
        const sinSeedsViejos = p.filter((pin) => !pin.esSeed);
        pinsFinales = [...generarPinesSeed(), ...sinSeedsViejos];
        await escribir(KEYS.pins, pinsFinales);
        await escribir(KEYS.seedAplicado, true);
        }

      setUsuarios(u);
      setPins(pinsFinales);
      setTableros(t);
      setComentarios(c);
      setNotificaciones(n);
      setConfiguracion(cfg);
      setCargando(false);
    })();
  }, []);

  // Aplicar tema a nivel nativo (leccion 11 del proyecto anterior)
  useEffect(() => {
    if (cargando) return;
    // NO llamamos a Appearance.setColorScheme: eso sobreescribe el modo
    // del sistema de forma permanente y rompe la opcion "Sistema".
    // El fondo nativo lo manejamos solo con SystemUI.
    const colorFondo = crearTema(modoEfectivo, configuracion.colorPrincipal).fondo;
    SystemUI.setBackgroundColorAsync(colorFondo).catch(() => {});
  }, [configuracion.colorPrincipal, modoEfectivo, cargando]);

  // Helpers de persistencia (state + AsyncStorage juntos)
  const guardarUsuarios = useCallback(async (lista: Usuario[]) => {
    setUsuarios(lista);
    await escribir(KEYS.usuarios, lista);
  }, []);
  const guardarPins = useCallback(async (lista: Pin[]) => {
    setPins(lista);
    await escribir(KEYS.pins, lista);
  }, []);
  const guardarTableros = useCallback(async (lista: Tablero[]) => {
    setTableros(lista);
    await escribir(KEYS.tableros, lista);
  }, []);
  const guardarComentarios = useCallback(async (lista: Comentario[]) => {
    setComentarios(lista);
    await escribir(KEYS.comentarios, lista);
  }, []);
  const guardarNotificaciones = useCallback(async (lista: Notificacion[]) => {
    setNotificaciones(lista);
    await escribir(KEYS.notificaciones, lista);
  }, []);
  // Crea o actualiza una notificacion. Evita duplicados cuando el mismo
  // usuario repite la misma accion sobre el mismo pin.
  const upsertNotificacion = useCallback(
    async (
      tipo: Notificacion['tipo'],
      pinId: string,
      usuarioDestinoId: string,
      usuarioOrigenId: string
    ) => {
      const existente = notificaciones.find(
        (n) =>
          n.tipo === tipo &&
          n.pinId === pinId &&
          n.usuarioDestinoId === usuarioDestinoId &&
          n.usuarioOrigenId === usuarioOrigenId
      );

      if (existente) {
        const actualizada: Notificacion = {
          ...existente,
          leida: false,
          creadoEn: Date.now(),
        };
        await guardarNotificaciones(
          notificaciones.map((n) => (n.id === existente.id ? actualizada : n))
        );
      } else {
        const nueva: Notificacion = {
          id: generarId(),
          usuarioDestinoId,
          tipo,
          pinId,
          usuarioOrigenId,
          leida: false,
          creadoEn: Date.now(),
        };
        await guardarNotificaciones([nueva, ...notificaciones]);
      }
    },
    [notificaciones, guardarNotificaciones]
  );
  const guardarConfiguracion = useCallback(async (cfg: Configuracion) => {
    setConfiguracion(cfg);
    await escribir(KEYS.configuracion, cfg);
  }, []);



  // ---- AUTH ----
  const registrar = useCallback<ContextoApp['registrar']>(
    async (nombreUsuario, email, password) => {
      const emailNorm = email.trim().toLowerCase();
      if (usuarios.some((u) => u.email === emailNorm)) {
        return { ok: false, error: 'Ese email ya está registrado' };
      }
        const nuevo: Usuario = {
        id: generarId(),
        nombreUsuario: nombreUsuario.trim(),
        email: emailNorm,
        passwordHash: await hashPassword(password),
        avatar: null,
        fechaRegistro: Date.now(),
        colorPrincipal: COLOR_DEFAULT,
      };
      await guardarUsuarios([...usuarios, nuevo]);
      await guardarConfiguracion({
        ...configuracion,
        usuarioActualId: nuevo.id,
        colorPrincipal: COLOR_DEFAULT,
      });
      return { ok: true };
    },
    [usuarios, configuracion, guardarUsuarios, guardarConfiguracion]
  );

  const login = useCallback<ContextoApp['login']>(
    async (email, password) => {
      const emailNorm = email.trim().toLowerCase();
      const hash = await hashPassword(password);
      const user = usuarios.find((u) => u.email === emailNorm);
      if (!user || user.passwordHash !== hash) {
        return { ok: false, error: 'Email o contraseña incorrectos' };
      }
      await guardarConfiguracion({
        ...configuracion,
        usuarioActualId: user.id,
        colorPrincipal: user.colorPrincipal ?? COLOR_DEFAULT,
      });
      return { ok: true };
    },
    [usuarios, configuracion, guardarConfiguracion]
  );

  const logout = useCallback(async () => {
    await guardarConfiguracion({
      ...configuracion,
      usuarioActualId: null,
      colorPrincipal: COLOR_DEFAULT,
    });
  }, [configuracion, guardarConfiguracion]);

  // ---- PINS ----
    const crearPin = useCallback<ContextoApp['crearPin']>(
    async ({
      titulo,
      descripcion,
      categoria,
      tableroId,
      imagenTemporal,
      anchoImagen,
      altoImagen,
    }) => {
      if (!usuarioActual) return null;
      const id = generarId();
      const rutaFinal = await copiarImagenAPins(imagenTemporal, id);
      const aspectRatio = anchoImagen > 0 && altoImagen > 0
        ? anchoImagen / altoImagen
        : 0.75;
      const nuevo: Pin = {
        id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen: rutaFinal,
        esSeed: false,
        autorId: usuarioActual.id,
        categoria,
        tableroId,
        likes: [],
        creadoEn: Date.now(),
        aspectRatio,
      };
      await guardarPins([nuevo, ...pins]);
      return nuevo;
    },
    [usuarioActual, pins, guardarPins]
  );

  const eliminarPin = useCallback(
    async (pinId: string) => {
      const pin = pins.find((p) => p.id === pinId);
      if (!pin || !usuarioActual || pin.autorId !== usuarioActual.id) return;
      if (!pin.esSeed) await borrarImagen(pin.imagen);
      await guardarPins(pins.filter((p) => p.id !== pinId));
      await guardarComentarios(comentarios.filter((c) => c.pinId !== pinId));
      await guardarNotificaciones(notificaciones.filter((n) => n.pinId !== pinId));
    },
    [pins, comentarios, notificaciones, usuarioActual, guardarPins, guardarComentarios, guardarNotificaciones]
  );

  const toggleLike = useCallback(
    async (pinId: string) => {
      if (!usuarioActual) return;
      const pin = pins.find((p) => p.id === pinId);
      if (!pin) return;
      const yaLikeado = pin.likes.includes(usuarioActual.id);
      const likesNuevos = yaLikeado
        ? pin.likes.filter((id) => id !== usuarioActual.id)
        : [...pin.likes, usuarioActual.id];
      await guardarPins(
        pins.map((p) => (p.id === pinId ? { ...p, likes: likesNuevos } : p))
      );
        if (!yaLikeado && pin.autorId !== usuarioActual.id && pin.autorId !== 'seed-sistema') {
        await upsertNotificacion('like', pin.id, pin.autorId, usuarioActual.id);
      }
    },
      [usuarioActual, pins, guardarPins, upsertNotificacion]
  );

  // ---- TABLEROS ----
  const crearTablero = useCallback<ContextoApp['crearTablero']>(
    async (nombre) => {
      if (!usuarioActual) return null;
      const nuevo: Tablero = {
        id: generarId(),
        nombre: nombre.trim(),
        autorId: usuarioActual.id,
        creadoEn: Date.now(),
      };
      await guardarTableros([nuevo, ...tableros]);
      return nuevo;
    },
    [usuarioActual, tableros, guardarTableros]
  );

  const eliminarTablero = useCallback(
    async (tableroId: string) => {
      if (!usuarioActual) return;
      const tab = tableros.find((t) => t.id === tableroId);
      if (!tab || tab.autorId !== usuarioActual.id) return;
      await guardarTableros(tableros.filter((t) => t.id !== tableroId));
      await guardarPins(
        pins.map((p) => (p.tableroId === tableroId ? { ...p, tableroId: null } : p))
      );
    },
    [usuarioActual, tableros, pins, guardarTableros, guardarPins]
  );

  const asignarPinATablero = useCallback(
    async (pinId: string, tableroId: string | null) => {
      if (!usuarioActual) return;
      const pin = pins.find((p) => p.id === pinId);
      if (!pin) return;
      await guardarPins(pins.map((p) => (p.id === pinId ? { ...p, tableroId } : p)));
      if (tableroId && pin.autorId !== usuarioActual.id && pin.autorId !== 'seed-sistema') {
        await upsertNotificacion('guardado', pin.id, pin.autorId, usuarioActual.id);
      }
    },
      [usuarioActual, pins, guardarPins, upsertNotificacion]
  );

  // ---- COMENTARIOS ----
  const agregarComentario = useCallback(
    async (pinId: string, texto: string) => {
      if (!usuarioActual || !texto.trim()) return;
      const comentario: Comentario = {
        id: generarId(),
        pinId,
        autorId: usuarioActual.id,
        texto: texto.trim(),
        creadoEn: Date.now(),
      };
      await guardarComentarios([comentario, ...comentarios]);
      const pin = pins.find((p) => p.id === pinId);
      if (pin && pin.autorId !== usuarioActual.id && pin.autorId !== 'seed-sistema') {
        const notif: Notificacion = {
          id: generarId(),
          usuarioDestinoId: pin.autorId,
          tipo: 'comentario',
          pinId,
          usuarioOrigenId: usuarioActual.id,
          leida: false,
          creadoEn: Date.now(),
        };
        await guardarNotificaciones([notif, ...notificaciones]);
      }
    },
    [usuarioActual, pins, comentarios, notificaciones, guardarComentarios, guardarNotificaciones]
  );

  const eliminarComentario = useCallback(
    async (comentarioId: string) => {
      if (!usuarioActual) return;
      const c = comentarios.find((x) => x.id === comentarioId);
      if (!c || c.autorId !== usuarioActual.id) return;
      await guardarComentarios(comentarios.filter((x) => x.id !== comentarioId));
    },
    [usuarioActual, comentarios, guardarComentarios]
  );

  // ---- NOTIFICACIONES ----
  const marcarNotificacionesLeidas = useCallback(async () => {
    if (!usuarioActual) return;
    await guardarNotificaciones(
      notificaciones.map((n) =>
        n.usuarioDestinoId === usuarioActual.id ? { ...n, leida: true } : n
      )
    );
  }, [usuarioActual, notificaciones, guardarNotificaciones]);

  // ---- CONFIG ----
  const setModoTema = useCallback(
    async (modo: Configuracion['modoTema']) => {
      await guardarConfiguracion({ ...configuracion, modoTema: modo });
    },
    [configuracion, guardarConfiguracion]
  );

  const setColorPrincipal = useCallback(
    async (color: string) => {
      if (!usuarioActual) {
        await guardarConfiguracion({ ...configuracion, colorPrincipal: color });
        return;
      }
      const usuarioActualizado: Usuario = { ...usuarioActual, colorPrincipal: color };
      await guardarUsuarios(
        usuarios.map((u) => (u.id === usuarioActual.id ? usuarioActualizado : u))
      );
      await guardarConfiguracion({ ...configuracion, colorPrincipal: color });
    },
    [usuarioActual, usuarios, configuracion, guardarUsuarios, guardarConfiguracion]
  );

  // ---- PERFIL ----
      const editarPerfil = useCallback<ContextoApp['editarPerfil']>(
    async ({ passwordActual, nombreUsuario, avatarTempUri, passwordNueva }) => {
      if (!usuarioActual) return { ok: false, error: 'No hay sesión activa' };

      // Solo se valida la contraseña actual si el usuario va a cambiarla.
      if (passwordNueva) {
        const hashActual = await hashPassword(passwordActual);
        if (hashActual !== usuarioActual.passwordHash) {
          return { ok: false, error: 'La contraseña actual no coincide' };
        }
      }

      let avatarFinal = usuarioActual.avatar;
      if (avatarTempUri === null) {
        avatarFinal = null;
      } else if (avatarTempUri) {
        avatarFinal = await copiarAvatar(avatarTempUri, usuarioActual.id);
      }

      const actualizado: Usuario = {
        ...usuarioActual,
        nombreUsuario: nombreUsuario?.trim() || usuarioActual.nombreUsuario,
        avatar: avatarFinal,
        passwordHash: passwordNueva
          ? await hashPassword(passwordNueva)
          : usuarioActual.passwordHash,
      };

      await guardarUsuarios(
        usuarios.map((u) => (u.id === actualizado.id ? actualizado : u))
      );
      return { ok: true };
    },
    [usuarioActual, usuarios, guardarUsuarios]
  );

  const valor = useMemo<ContextoApp>(
    () => ({
      cargando,
      usuarios,
      pins,
      tableros,
      comentarios,
      notificaciones,
      configuracion,
      usuarioActual,
      tema,
      modoEfectivo,
      registrar,
      login,
      logout,
      crearPin,
      eliminarPin,
      toggleLike,
      crearTablero,
      eliminarTablero,
      asignarPinATablero,
      agregarComentario,
      eliminarComentario,
      marcarNotificacionesLeidas,
      setModoTema,
      setColorPrincipal,
      editarPerfil,
    }),
    [
      cargando, usuarios, pins, tableros, comentarios, notificaciones,
      configuracion, usuarioActual, tema, modoEfectivo,
      registrar, login, logout,
      crearPin, eliminarPin, toggleLike,
      crearTablero, eliminarTablero, asignarPinATablero,
      agregarComentario, eliminarComentario, marcarNotificacionesLeidas,
      setModoTema, setColorPrincipal, editarPerfil,
    ]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp(): ContextoApp {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
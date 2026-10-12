import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'
import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { fuenteImagen } from '../storage/seed';
import { formatearFecha } from '../utils/fechas';
import { Notificacion, TipoNotificacion } from '../types';

const ICONOS: Record<TipoNotificacion, { nombre: keyof typeof Ionicons.glyphMap; texto: string }> = {
  like: { nombre: 'heart', texto: 'le dio me gusta a tu pin' },
  comentario: { nombre: 'chatbubble', texto: 'comentó tu pin' },
  guardado: { nombre: 'albums', texto: 'guardó tu pin en un tablero' },
};

export default function NotificacionesScreen({
  navigation,
}: AppScreenProps<'Notificaciones'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const {
    notificaciones,
    usuarios,
    pins,
    usuarioActual,
    marcarNotificacionesLeidas,
  } = useApp();

  const mias = useMemo(
    () =>
      usuarioActual
        ? notificaciones
            .filter((n) => n.usuarioDestinoId === usuarioActual.id)
            .sort((a, b) => b.creadoEn - a.creadoEn)
        : [],
    [notificaciones, usuarioActual]
  );

    useFocusEffect(
    useCallback(() => {
      // Al salir de la pantalla, marca todo como leido.
      return () => {
        marcarNotificacionesLeidas();
      };
    }, [marcarNotificacionesLeidas])
  );

  function irAlPin(notif: Notificacion) {
    const pinExiste = pins.some((p) => p.id === notif.pinId);
    if (!pinExiste) return;
    navigation.navigate('PinDetail', { pinId: notif.pinId });
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Notificaciones</Text>
        <View style={{ width: 26 }} />
      </View>

      {mias.length === 0 ? (
        <View style={estilos.vacio}>
          <View
            style={[estilos.vacioIcono, { backgroundColor: tema.superficie }]}
          >
            <Ionicons
              name="notifications-outline"
              size={42}
              color={tema.textoSuave}
            />
          </View>
          <Text style={estilos.vacioTitulo}>Sin notificaciones</Text>
          <Text style={estilos.vacioTexto}>
            Cuando alguien interactúe con tus pins, lo verás aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={mias}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const origen = usuarios.find((u) => u.id === item.usuarioOrigenId);
            const pin = pins.find((p) => p.id === item.pinId);
            const info = ICONOS[item.tipo];
            const inicial = (origen?.nombreUsuario ?? '?')
              .charAt(0)
              .toUpperCase();

            return (
              <Pressable
                onPress={() => irAlPin(item)}
                disabled={!pin}
                  style={[
                  estilos.item,
                  {
                    backgroundColor: item.leida
                      ? 'transparent'
                      : tema.primarioSuave,
                  },
                ]}
              >
                {!item.leida && (
                  <View
                    style={[estilos.puntoNoLeida, { backgroundColor: tema.primario }]}
                  />
                )}
                <View style={estilos.avatarWrapper}>
                  {origen?.avatar ? (
                    <Image
                      source={{ uri: origen.avatar }}
                      style={estilos.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        estilos.avatar,
                        {
                          backgroundColor: tema.superficieAlt,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: tema.primario,
                          fontWeight: '800',
                          fontSize: 16,
                        }}
                      >
                        {inicial}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      estilos.iconoTipo,
                      { backgroundColor: tema.primario, borderColor: tema.fondo },
                    ]}
                  >
                    <Ionicons
                      name={info.nombre}
                      size={11}
                      color={tema.textoInverso}
                    />
                  </View>
                </View>

                <View style={estilos.textoWrapper}>
                  <Text style={estilos.textoPrincipal}>
                    <Text style={estilos.nombre}>
                      {origen?.nombreUsuario ?? 'Alguien'}
                    </Text>{' '}
                    {info.texto}
                  </Text>
                  <Text style={estilos.fecha}>
                    {formatearFecha(item.creadoEn)}
                  </Text>
                </View>

                {pin && (
                  <Image
                    source={fuenteImagen(pin.imagen)}
                    style={estilos.thumb}
                  />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: tema.fondo },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitulo: { color: tema.texto, fontSize: 16, fontWeight: '700' },

    lista: { paddingVertical: 8 },

    puntoNoLeida: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: -4,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    iconoTipo: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    textoWrapper: { flex: 1 },
    textoPrincipal: {
      color: tema.texto,
      fontSize: 14,
      lineHeight: 19,
    },
    nombre: { fontWeight: '800' },
    fecha: {
      color: tema.textoSuave,
      fontSize: 12,
      marginTop: 2,
    },
    thumb: {
      width: 52,
      height: 52,
      borderRadius: 10,
      backgroundColor: tema.superficie,
    },

    vacio: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 8,
    },
    vacioIcono: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    vacioTitulo: {
      color: tema.texto,
      fontSize: 18,
      fontWeight: '800',
    },
    vacioTexto: {
      color: tema.textoSuave,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
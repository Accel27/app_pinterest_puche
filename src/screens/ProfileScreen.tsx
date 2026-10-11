import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { TabScreenProps } from '../navigation/types';
import PinCard from '../components/PinCard';
import TabsInternos, { TabInterno } from '../components/TabsInternos';

const PADDING_H = 18;
const GAP = 14;

export default function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { usuarioActual, pins, tableros, logout, eliminarTablero } = useApp();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<TabInterno>('pins');

  const anchoCard = (width - PADDING_H * 2 - GAP) / 2;

  const misPins = useMemo(
    () =>
      usuarioActual
        ? pins
            .filter((p) => p.autorId === usuarioActual.id)
            .sort((a, b) => b.creadoEn - a.creadoEn)
        : [],
    [pins, usuarioActual]
  );

  const misTableros = useMemo(
    () =>
      usuarioActual
        ? tableros
            .filter((t) => t.autorId === usuarioActual.id)
            .sort((a, b) => b.creadoEn - a.creadoEn)
        : [],
    [tableros, usuarioActual]
  );

  const pinsLikeados = useMemo(
    () =>
      usuarioActual
        ? pins.filter((p) => p.likes.includes(usuarioActual.id))
        : [],
    [pins, usuarioActual]
  );

  if (!usuarioActual) return null;

  const inicial = usuarioActual.nombreUsuario.charAt(0).toUpperCase();

  function confirmarLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() },
      ]
    );
  }

  function confirmarEliminarTablero(id: string, nombre: string) {
    Alert.alert(
      `Eliminar "${nombre}"`,
      'Los pins dentro de este tablero no se eliminarán, solo dejarán de pertenecer al tablero.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarTablero(id),
        },
      ]
    );
  }

  const contarPinsTablero = (id: string) =>
    pins.filter((p) => p.tableroId === id).length;

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={estilos.headerPerfil}>
          {usuarioActual.avatar ? (
            <Image source={{ uri: usuarioActual.avatar }} style={estilos.avatar} />
          ) : (
            <View
              style={[estilos.avatarPlaceholder, { backgroundColor: tema.primarioSuave }]}
            >
              <Text style={[estilos.avatarInicial, { color: tema.primario }]}>
                {inicial}
              </Text>
            </View>
          )}
          <Text style={estilos.nombre}>{usuarioActual.nombreUsuario}</Text>
          <Text style={estilos.email}>{usuarioActual.email}</Text>

          <View style={estilos.botonesPerfil}>
            <Pressable
              onPress={() => navigation.navigate('EditarPerfil')}
              style={[estilos.botonPerfil, { backgroundColor: tema.superficie }]}
            >
              <Ionicons name="create-outline" size={18} color={tema.texto} />
              <Text style={[estilos.botonPerfilTexto, { color: tema.texto }]}>
                Editar perfil
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('CreateBoard')}
              style={[estilos.botonPerfil, { backgroundColor: tema.superficie }]}
            >
              <Ionicons name="add" size={20} color={tema.texto} />
              <Text style={[estilos.botonPerfilTexto, { color: tema.texto }]}>
                Nuevo tablero
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[estilos.stats, { borderTopColor: tema.borde, borderBottomColor: tema.borde }]}>
          <View style={estilos.stat}>
            <Text style={estilos.statNumero}>{misPins.length}</Text>
            <Text style={estilos.statLabel}>Pins</Text>
          </View>
          <View style={[estilos.statDivisor, { backgroundColor: tema.borde }]} />
          <View style={estilos.stat}>
            <Text style={estilos.statNumero}>{misTableros.length}</Text>
            <Text style={estilos.statLabel}>Tableros</Text>
          </View>
          <View style={[estilos.statDivisor, { backgroundColor: tema.borde }]} />
          <View style={estilos.stat}>
            <Text style={estilos.statNumero}>{pinsLikeados.length}</Text>
            <Text style={estilos.statLabel}>Me gusta</Text>
          </View>
        </View>

        <TabsInternos
          activo={tab}
          onChange={setTab}
          counts={{
            pins: misPins.length,
            tableros: misTableros.length,
            liked: pinsLikeados.length,
          }}
        />

        {tab === 'pins' && (
          <ContenidoPins
            pins={misPins}
            anchoCard={anchoCard}
            navigation={navigation}
            vacio="Todavía no has creado ningún pin"
          />
        )}

        {tab === 'liked' && (
          <ContenidoPins
            pins={pinsLikeados}
            anchoCard={anchoCard}
            navigation={navigation}
            vacio="Aún no has dado me gusta a ningún pin"
          />
        )}

        {tab === 'tableros' && (
          <View style={estilos.tablerosWrapper}>
            {misTableros.length === 0 ? (
              <View style={estilos.vacio}>
                <Ionicons name="albums-outline" size={54} color={tema.textoSuave} />
                <Text style={estilos.vacioTitulo}>Sin tableros</Text>
                <Text style={estilos.vacioTexto}>
                  Crea tu primer tablero para organizar tus ideas
                </Text>
              </View>
            ) : (
              misTableros.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() =>
                    navigation.navigate('TableroDetail', { tableroId: t.id })
                  }
                  style={[estilos.tableroFila, { backgroundColor: tema.superficie }]}
                >
                  <View
                    style={[
                      estilos.tableroIcono,
                      { backgroundColor: tema.primarioSuave },
                    ]}
                  >
                    <Ionicons name="albums" size={22} color={tema.primario} />
                  </View>
                  <View style={estilos.tableroInfo}>
                    <Text style={estilos.tableroNombre} numberOfLines={1}>
                      {t.nombre}
                    </Text>
                    <Text style={estilos.tableroCount}>
                      {contarPinsTablero(t.id)}{' '}
                      {contarPinsTablero(t.id) === 1 ? 'pin' : 'pins'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => confirmarEliminarTablero(t.id, t.nombre)}
                    hitSlop={8}
                    style={estilos.tableroBasura}
                  >
                    <Ionicons name="trash-outline" size={20} color={tema.textoSuave} />
                  </Pressable>
                </Pressable>
              ))
            )}
          </View>
        )}

        <Pressable
          onPress={confirmarLogout}
          style={[estilos.botonLogout, { borderColor: tema.borde }]}
        >
          <Ionicons name="log-out-outline" size={20} color={tema.peligro} />
          <Text style={[estilos.botonLogoutTexto, { color: tema.peligro }]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContenidoPins({
  pins,
  anchoCard,
  navigation,
  vacio,
}: {
  pins: any[];
  anchoCard: number;
  navigation: any;
  vacio: string;
}) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  if (pins.length === 0) {
    return (
      <View style={estilos.vacio}>
        <Ionicons name="image-outline" size={54} color={tema.textoSuave} />
        <Text style={estilos.vacioTitulo}>Sin pins</Text>
        <Text style={estilos.vacioTexto}>{vacio}</Text>
      </View>
    );
  }

  return (
    <View style={estilos.pinsWrapper}>
      {pins.map((p) => (
        <PinCard
          key={p.id}
          pin={p}
          ancho={anchoCard}
          onPress={() => navigation.navigate('PinDetail', { pinId: p.id })}
        />
      ))}
    </View>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: tema.fondo },

    headerPerfil: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInicial: { fontSize: 38, fontWeight: '800' },
    nombre: {
      color: tema.texto,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 12,
    },
    email: { color: tema.textoSuave, fontSize: 13, marginTop: 2 },
    botonesPerfil: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      marginBottom: 20,
    },
    botonPerfil: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
    },
    botonPerfilTexto: { fontSize: 13, fontWeight: '700' },

    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      paddingVertical: 14,
    },
    stat: { flex: 1, alignItems: 'center' },
    statNumero: { color: tema.texto, fontSize: 18, fontWeight: '800' },
    statLabel: { color: tema.textoSuave, fontSize: 12, marginTop: 2 },
    statDivisor: { width: 1, height: 26 },

    pinsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: PADDING_H,
      paddingTop: 16,
    },
    tablerosWrapper: { paddingHorizontal: PADDING_H, paddingTop: 16 },
    tableroFila: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      marginBottom: 10,
      gap: 12,
    },
    tableroIcono: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tableroInfo: { flex: 1 },
    tableroNombre: { color: tema.texto, fontSize: 15, fontWeight: '700' },
    tableroCount: { color: tema.textoSuave, fontSize: 12, marginTop: 2 },
    tableroBasura: { padding: 6 },

    vacio: {
      alignItems: 'center',
      paddingTop: 48,
      paddingHorizontal: 24,
      gap: 8,
      width: '100%',
    },
    vacioTitulo: {
      color: tema.texto,
      fontSize: 17,
      fontWeight: '700',
      marginTop: 6,
    },
    vacioTexto: {
      color: tema.textoSuave,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
    },

    botonLogout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: PADDING_H,
      marginTop: 32,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    botonLogoutTexto: { fontSize: 14, fontWeight: '700' },
  });
}
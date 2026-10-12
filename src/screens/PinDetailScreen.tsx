import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { ETIQUETA_CATEGORIA, fuenteImagen } from '../storage/seed';
import { formatearFecha } from '../utils/fechas';
import ComentarioItem from '../components/ComentarioItem';
import ModalSelectorTablero from '../components/ModalSelectorTablero';

export default function PinDetailScreen({
  route,
  navigation,
}: AppScreenProps<'PinDetail'>) {
  const { pinId } = route.params;
  const { width } = useWindowDimensions();
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const {
    pins,
    usuarios,
    comentarios,
    tableros,
    usuarioActual,
    toggleLike,
    agregarComentario,
    eliminarComentario,
    eliminarPin,
    asignarPinATablero,
    crearTablero,
  } = useApp();

  const [textoComentario, setTextoComentario] = useState('');
  const [modalTablero, setModalTablero] = useState(false);
  const [aspectReal, setAspectReal] = useState<number | null>(null);

  const pin = useMemo(() => pins.find((p) => p.id === pinId), [pins, pinId]);

  const uriImagen = pin && !pin.esSeed ? pin.imagen : null;

      useEffect(() => {
    if (!pin) {
      setAspectReal(null);
      return;
    }
    const source = fuenteImagen(pin.imagen);
    const resolved = Image.resolveAssetSource(source);
    const w = resolved?.width;
    const h = resolved?.height;

    // LOG TEMPORAL: para ver en Metro que dimensiones lee
    console.log('[PinDetail] aspect debug', {
      imagen: pin.imagen,
      uri: resolved?.uri,
      w,
      h,
      aspectCalculado: w && h ? w / h : null,
      aspectFallback: pin.aspectRatio,
    });

    if (w && h && w > 0 && h > 0) {
      setAspectReal(w / h);
    } else {
      setAspectReal(pin.aspectRatio ?? 0.75);
    }
  }, [pin?.id, pin?.imagen, pin?.aspectRatio]);

  const autorPin = useMemo(
    () => (pin ? usuarios.find((u) => u.id === pin.autorId) : undefined),
    [pin, usuarios]
  );

  const comentariosPin = useMemo(
    () =>
      comentarios
        .filter((c) => c.pinId === pinId)
        .sort((a, b) => b.creadoEn - a.creadoEn),
    [comentarios, pinId]
  );

  const tablerosDelUsuario = useMemo(
    () =>
      usuarioActual
        ? tableros.filter((t) => t.autorId === usuarioActual.id)
        : [],
    [tableros, usuarioActual]
  );

  if (!pin) {
    return (
      <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
        <View style={estilos.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={26} color={tema.texto} />
          </Pressable>
        </View>
        <View style={estilos.centrado}>
          <Text style={{ color: tema.textoSuave }}>Este pin ya no existe</Text>
        </View>
      </SafeAreaView>
    );
  }

  const esAutor = usuarioActual?.id === pin.autorId;
  const likeado = usuarioActual ? pin.likes.includes(usuarioActual.id) : false;
  const tableroActual = tableros.find((t) => t.id === pin.tableroId);
  const aspectMostrar = aspectReal ?? pin.aspectRatio ?? 0.75;

  function confirmarEliminarPin() {
    Alert.alert(
      'Eliminar pin',
      '¿Estás seguro que quieres eliminar este pin? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarPin(pin!.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  async function enviarComentario() {
    if (!textoComentario.trim()) return;
    await agregarComentario(pin!.id, textoComentario);
    setTextoComentario('');
  }

  async function seleccionarTablero(tableroId: string | null) {
    await asignarPinATablero(pin!.id, tableroId);
    setModalTablero(false);
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Pin</Text>
        {esAutor ? (
          <Pressable onPress={confirmarEliminarPin} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={tema.texto} />
          </Pressable>
        ) : (
          <View style={{ width: 26 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={estilos.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View
            style={{
              width: width,
              height: width / aspectMostrar,
              backgroundColor: tema.superficie,
            }}
          >
            <Image
              source={fuenteImagen(pin.imagen)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          <View style={estilos.contenido}>
            <View style={[estilos.badgeCat, { backgroundColor: tema.primarioSuave }]}>
              <Text style={[estilos.badgeTexto, { color: tema.primario }]}>
                {ETIQUETA_CATEGORIA[pin.categoria]}
              </Text>
            </View>

            <Text style={estilos.titulo}>{pin.titulo}</Text>
            {!!pin.descripcion && (
              <Text style={estilos.descripcion}>{pin.descripcion}</Text>
            )}

            <View style={estilos.metaFila}>
              {!pin.esSeed && (
                <Text style={estilos.meta}>
                  Por {autorPin?.nombreUsuario ?? 'Usuario'}
                </Text>
              )}
              <Text style={estilos.meta}>{formatearFecha(pin.creadoEn)}</Text>
            </View>

            <View style={estilos.acciones}>
              <Pressable
                onPress={() => toggleLike(pin.id)}
                style={[
                  estilos.botonAccion,
                  {
                    backgroundColor: likeado ? tema.primario : tema.superficie,
                  },
                ]}
              >
                <Ionicons
                  name={likeado ? 'heart' : 'heart-outline'}
                  size={20}
                  color={likeado ? tema.textoInverso : tema.texto}
                />
                <Text
                  style={[
                    estilos.botonAccionTexto,
                    { color: likeado ? tema.textoInverso : tema.texto },
                  ]}
                >
                  {pin.likes.length}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModalTablero(true)}
                style={[estilos.botonAccion, { backgroundColor: tema.superficie }]}
              >
                <Ionicons
                  name={tableroActual ? 'albums' : 'albums-outline'}
                  size={20}
                  color={tema.texto}
                />
                <Text style={[estilos.botonAccionTexto, { color: tema.texto }]}>
                  {tableroActual ? tableroActual.nombre : 'Guardar'}
                </Text>
              </Pressable>
            </View>

            <View style={[estilos.separador, { backgroundColor: tema.borde }]} />

            <Text style={estilos.tituloSeccion}>
              Comentarios {comentariosPin.length > 0 && `(${comentariosPin.length})`}
            </Text>

            {comentariosPin.length === 0 ? (
              <Text style={estilos.sinComentarios}>
                Aún no hay comentarios. Sé el primero.
              </Text>
            ) : (
              comentariosPin.map((c) => (
                <ComentarioItem
                  key={c.id}
                  comentario={c}
                  autor={usuarios.find((u) => u.id === c.autorId)}
                  puedeEliminar={c.autorId === usuarioActual?.id}
                  onEliminar={() =>
                    Alert.alert(
                      'Eliminar comentario',
                      '¿Seguro que quieres eliminar este comentario?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => eliminarComentario(c.id),
                        },
                      ]
                    )
                  }
                />
              ))
            )}
          </View>
        </ScrollView>

        <View style={[estilos.inputWrapper, { borderTopColor: tema.borde }]}>
          <TextInput
            style={estilos.input}
            value={textoComentario}
            onChangeText={setTextoComentario}
            placeholder="Escribe un comentario..."
            placeholderTextColor={tema.textoSuave}
            multiline
            maxLength={300}
          />
          <Pressable
            onPress={enviarComentario}
            disabled={!textoComentario.trim()}
            style={[
              estilos.botonEnviar,
              {
                backgroundColor: textoComentario.trim()
                  ? tema.primario
                  : tema.superficieAlt,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={textoComentario.trim() ? tema.textoInverso : tema.textoSuave}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ModalSelectorTablero
        visible={modalTablero}
        tableros={tablerosDelUsuario}
        tableroActualId={pin.tableroId}
        onCerrar={() => setModalTablero(false)}
        onSeleccionar={seleccionarTablero}
        onCrearTablero={async (nombre) => {
          const nuevo = await crearTablero(nombre);
          if (nuevo) await asignarPinATablero(pin.id, nuevo.id);
          setModalTablero(false);
        }}
      />
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
    centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingBottom: 24 }, 
    contenido: { paddingHorizontal: 20, paddingTop: 20 },
    badgeCat: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      marginBottom: 12,
    },
    badgeTexto: { fontSize: 12, fontWeight: '700' },
    titulo: {
      color: tema.texto,
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 28,
    },
    descripcion: {
      color: tema.texto,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 10,
    },
    metaFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 14,
    },
    meta: { color: tema.textoSuave, fontSize: 12 },
    acciones: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
    botonAccion: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
    },
    botonAccionTexto: { fontSize: 14, fontWeight: '700' },
    separador: { height: 1, marginVertical: 24 },
    tituloSeccion: {
      color: tema.texto,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    sinComentarios: {
      color: tema.textoSuave,
      fontSize: 13,
      fontStyle: 'italic',
      paddingVertical: 12,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      gap: 8,
    },
    input: {
      flex: 1,
      color: tema.texto,
      backgroundColor: tema.superficie,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 100,
      fontSize: 14,
    },
    botonEnviar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
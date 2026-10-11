import { useMemo, useState } from 'react';
import {
  Keyboard,
  ActivityIndicator,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { Categoria } from '../types';
import ChipsCategorias from '../components/ChipsCategorias';
import ModalSelectorTablero from '../components/ModalSelectorTablero';

export default function AddPinScreen({ navigation }: AppScreenProps<'AddPin'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { usuarioActual, tableros, crearPin, crearTablero } = useApp();

  const [imagen, setImagen] = useState<{
  uri: string;
  width: number;
  height: number;
  } | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Arte');
  const [tableroId, setTableroId] = useState<string | null>(null);
  const [errorTitulo, setErrorTitulo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [modalTablero, setModalTablero] = useState(false);

  const tablerosDelUsuario = useMemo(
    () => (usuarioActual ? tableros.filter((t) => t.autorId === usuarioActual.id) : []),
    [tableros, usuarioActual]
  );

  const tableroSeleccionado = tableros.find((t) => t.id === tableroId);

  const puedePublicar = !!imagen && !!titulo.trim() && !cargando;

  async function pedirDeGaleria() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tus fotos para elegir una imagen.'
      );
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!resultado.canceled && resultado.assets[0]) {
  const asset = resultado.assets[0];
    setImagen({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      });
    }
  }

  async function pedirDeCamara() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para tomar una foto.'
      );
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!resultado.canceled && resultado.assets[0]) {
  const asset = resultado.assets[0];
    setImagen({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      });
    }
  }

  async function publicar() {
    if (!imagen) {
      Alert.alert('Falta imagen', 'Elegí o tomá una foto primero.');
      return;
    }
    const limpio = titulo.trim();
    if (limpio.length < 2) {
      setErrorTitulo('El título debe tener al menos 2 caracteres');
      return;
    }
    Keyboard.dismiss();
    setCargando(true);
      const pin = await crearPin({
        titulo: limpio,
        descripcion: descripcion.trim(),
        categoria,
        tableroId,
        imagenTemporal: imagen.uri,
        anchoImagen: imagen.width,
        altoImagen: imagen.height,
      });
    setCargando(false);

    if (pin) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'No se pudo crear el pin. Intentá de nuevo.');
    }
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Crear pin</Text>
        <Pressable
          onPress={publicar}
          disabled={!puedePublicar}
          hitSlop={8}
          style={[
            estilos.botonHeader,
            {
              backgroundColor: puedePublicar ? tema.primario : tema.superficieAlt,
            },
          ]}
        >
          {cargando ? (
            <ActivityIndicator size="small" color={tema.textoInverso} />
          ) : (
            <Text
              style={[
                estilos.botonHeaderTexto,
                { color: puedePublicar ? tema.textoInverso : tema.textoSuave },
              ]}
            >
              Publicar
            </Text>
          )}
        </Pressable>
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
          {imagen ? (
            <View style={estilos.previewWrapper}>
              <Image
                source={{ uri: imagen.uri }}
                style={estilos.preview}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setImagen(null)}
                style={estilos.botonQuitarImagen}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={pedirDeGaleria}
                style={estilos.botonCambiar}
              >
                <Ionicons name="images-outline" size={18} color={tema.textoInverso} />
                <Text style={estilos.botonCambiarTexto}>Cambiar imagen</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[estilos.placeholder, { borderColor: tema.borde }]}>
              <Ionicons name="image-outline" size={54} color={tema.textoSuave} />
              <Text style={estilos.placeholderTitulo}>Añade una imagen</Text>
              <Text style={estilos.placeholderTexto}>
                Elegí una foto de tu galería o tomá una nueva
              </Text>
              <View style={estilos.botonesImagen}>
                <Pressable
                  onPress={pedirDeGaleria}
                  style={[estilos.botonImagen, { backgroundColor: tema.primario }]}
                >
                  <Ionicons name="images-outline" size={18} color={tema.textoInverso} />
                  <Text style={[estilos.botonImagenTexto, { color: tema.textoInverso }]}>
                    Galería
                  </Text>
                </Pressable>
                <Pressable
                  onPress={pedirDeCamara}
                  style={[
                    estilos.botonImagen,
                    { backgroundColor: tema.superficie, borderWidth: 1, borderColor: tema.borde },
                  ]}
                >
                  <Ionicons name="camera-outline" size={18} color={tema.texto} />
                  <Text style={[estilos.botonImagenTexto, { color: tema.texto }]}>
                    Cámara
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={estilos.label}>Título</Text>
          <TextInput
            style={[
              estilos.input,
              errorTitulo ? { borderColor: tema.peligro } : null,
            ]}
            value={titulo}
            onChangeText={(t) => {
              setTitulo(t);
              if (errorTitulo) setErrorTitulo(null);
            }}
            placeholder="Ej: Paisaje de montaña"
            placeholderTextColor={tema.textoSuave}
            maxLength={80}
          />
          {errorTitulo && <Text style={estilos.error}>{errorTitulo}</Text>}

          <Text style={estilos.label}>Descripción</Text>
          <TextInput
            style={[estilos.input, estilos.textarea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Contá algo sobre este pin (opcional)"
            placeholderTextColor={tema.textoSuave}
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
          />

          <Text style={estilos.label}>Categoría</Text>
          <ChipsCategorias
            seleccionada={categoria}
            onSeleccionar={(c) => c && setCategoria(c)}
            incluirTodas={false}
          />

          <Text style={[estilos.label, { marginTop: 20 }]}>Tablero (opcional)</Text>
          <Pressable
            onPress={() => setModalTablero(true)}
            style={[estilos.selectorTablero, { backgroundColor: tema.superficie }]}
          >
            <Ionicons
              name={tableroSeleccionado ? 'albums' : 'albums-outline'}
              size={20}
              color={tema.texto}
            />
            <Text style={estilos.selectorTableroTexto} numberOfLines={1}>
              {tableroSeleccionado ? tableroSeleccionado.nombre : 'Sin tablero'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={tema.textoSuave} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalSelectorTablero
        visible={modalTablero}
        titulo="Elegir tablero"
        tableros={tablerosDelUsuario}
        tableroActualId={tableroId}
        onCerrar={() => setModalTablero(false)}
        onSeleccionar={(id) => {
          setTableroId(id);
          setModalTablero(false);
        }}
        onCrearTablero={async (nombre) => {
          const nuevo = await crearTablero(nombre);
          if (nuevo) setTableroId(nuevo.id);
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
      gap: 12,
    },
    headerTitulo: {
      color: tema.texto,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    botonHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 86,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonHeaderTexto: { fontSize: 14, fontWeight: '700' },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },

    placeholder: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 20,
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 24,
      gap: 10,
    },
    placeholderTitulo: {
      color: tema.texto,
      fontSize: 17,
      fontWeight: '700',
      marginTop: 4,
    },
    placeholderTexto: {
      color: tema.textoSuave,
      fontSize: 13,
      textAlign: 'center',
    },
    botonesImagen: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    botonImagen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
    },
    botonImagenTexto: { fontSize: 13, fontWeight: '700' },

    previewWrapper: {
      width: '100%',
      marginBottom: 24,
      position: 'relative',
    },
    preview: {
      width: '100%',
      aspectRatio: 4 / 5,
      borderRadius: 20,
      backgroundColor: tema.superficie,
    },
    botonQuitarImagen: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonCambiar: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    botonCambiarTexto: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },

    label: {
      color: tema.textoSuave,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: tema.superficie,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: tema.texto,
      fontSize: 15,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    textarea: {
      minHeight: 96,
      paddingTop: 14,
    },
    error: {
      color: tema.peligro,
      fontSize: 12,
      marginTop: -12,
      marginBottom: 14,
      marginLeft: 4,
    },
    selectorTablero: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
    },
    selectorTableroTexto: {
      color: tema.texto,
      fontSize: 15,
      flex: 1,
    },
  });
}
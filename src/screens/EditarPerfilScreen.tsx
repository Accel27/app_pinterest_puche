import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import CampoTexto from '../components/CampoTexto';
import BotonPrincipal from '../components/BotonPrincipal';
import { validarNombreUsuario, validarPassword } from '../utils/validaciones';

export default function EditarPerfilScreen({
  navigation,
}: AppScreenProps<'EditarPerfil'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { usuarioActual, editarPerfil } = useApp();

  const [nombre, setNombre] = useState(usuarioActual?.nombreUsuario ?? '');
  const [avatarTemp, setAvatarTemp] = useState<string | null | undefined>(undefined);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Record<string, string | null>>({});
  const [cargando, setCargando] = useState(false);

  const avatarMostrar =
    avatarTemp === undefined ? usuarioActual?.avatar : avatarTemp;

  async function elegirAvatar() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) {
      setAvatarTemp(r.assets[0].uri);
    }
  }

  async function guardar() {
    const errs: Record<string, string | null> = {};
    const eNombre = validarNombreUsuario(nombre);
    if (eNombre) errs.nombre = eNombre;

    // La contraseña actual solo es obligatoria si se va a cambiar la contraseña.
    if (passwordNueva) {
      if (!passwordActual) {
        errs.passwordActual = 'Debes ingresar tu contraseña actual para cambiarla';
      }
      const ePass = validarPassword(passwordNueva);
      if (ePass) errs.passwordNueva = ePass;
      if (passwordNueva !== confirmacion) {
        errs.confirmacion = 'Las contraseñas no coinciden';
      }
    }

    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setCargando(true);
    const r = await editarPerfil({
      passwordActual,
      nombreUsuario: nombre,
      avatarTempUri: avatarTemp,
      passwordNueva: passwordNueva || undefined,
    });
    setCargando(false);

    if (r.ok) {
      Alert.alert('Listo', 'Tu perfil se actualizó correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      setErrores({ general: r.error ?? 'No se pudo actualizar' });
    }
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Editar perfil</Text>
        <View style={{ width: 26 }} />
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
          <View style={estilos.avatarWrapper}>
            {avatarMostrar ? (
              <Image source={{ uri: avatarMostrar }} style={estilos.avatarImagen} />
            ) : (
              <View
                style={[
                  estilos.avatarPlaceholder,
                  { backgroundColor: tema.primarioSuave },
                ]}
              >
                <Text style={[estilos.avatarInicial, { color: tema.primario }]}>
                  {(usuarioActual?.nombreUsuario ?? '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Pressable
              onPress={elegirAvatar}
              style={[estilos.botonAvatar, { backgroundColor: tema.primario }]}
            >
              <Ionicons name="camera" size={16} color={tema.textoInverso} />
            </Pressable>
          </View>

          {avatarMostrar && (
            <Pressable
              onPress={() => setAvatarTemp(null)}
              style={estilos.quitarAvatar}
            >
              <Text style={[estilos.quitarAvatarTexto, { color: tema.peligro }]}>
                Quitar foto
              </Text>
            </Pressable>
          )}

          <Text style={estilos.seccion}>Información básica</Text>

          <CampoTexto
            label="Nombre de usuario"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              if (errores.nombre) setErrores((p) => ({ ...p, nombre: null }));
            }}
            error={errores.nombre}
          />

          <Text style={estilos.seccion}>Cambiar contraseña</Text>
          <Text style={estilos.ayuda}>
            Deja los campos vacíos si no quieres cambiarla.
          </Text>

          <CampoTexto
            label="Contraseña actual"
            value={passwordActual}
            onChangeText={(t) => {
              setPasswordActual(t);
              if (errores.passwordActual)
                setErrores((p) => ({ ...p, passwordActual: null }));
              if (errores.general) setErrores((p) => ({ ...p, general: null }));
            }}
            esPassword
            placeholder="Tu contraseña actual"
            error={errores.passwordActual}
          />

          <CampoTexto
            label="Nueva contraseña"
            value={passwordNueva}
            onChangeText={(t) => {
              setPasswordNueva(t);
              if (errores.passwordNueva)
                setErrores((p) => ({ ...p, passwordNueva: null }));
            }}
            esPassword
            placeholder="Mínimo 6 caracteres, letras y números"
            error={errores.passwordNueva}
          />

          <CampoTexto
            label="Confirmar nueva contraseña"
            value={confirmacion}
            onChangeText={(t) => {
              setConfirmacion(t);
              if (errores.confirmacion)
                setErrores((p) => ({ ...p, confirmacion: null }));
            }}
            esPassword
            placeholder="Repite la nueva contraseña"
            error={errores.confirmacion}
          />

          {errores.general && (
            <View style={estilos.errorGeneral}>
              <Ionicons name="alert-circle" size={18} color={tema.peligro} />
              <Text style={estilos.errorGeneralTexto}>{errores.general}</Text>
            </View>
          )}

          <BotonPrincipal
            titulo="Guardar cambios"
            onPress={guardar}
            cargando={cargando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    scroll: { paddingHorizontal: 24, paddingBottom: 32 },
    avatarWrapper: {
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
      position: 'relative',
    },
    avatarImagen: { width: 110, height: 110, borderRadius: 55 },
    avatarPlaceholder: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInicial: { fontSize: 42, fontWeight: '800' },
    botonAvatar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: tema.fondo,
    },
    quitarAvatar: { alignSelf: 'center', padding: 8 },
    quitarAvatarTexto: { fontSize: 13, fontWeight: '600' },
    seccion: {
      color: tema.texto,
      fontSize: 15,
      fontWeight: '800',
      marginTop: 20,
      marginBottom: 12,
    },
    ayuda: {
      color: tema.textoSuave,
      fontSize: 12,
      marginTop: -8,
      marginBottom: 12,
    },
    errorGeneral: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.primarioSuave,
      padding: 12,
      borderRadius: 10,
      gap: 8,
      marginBottom: 12,
    },
    errorGeneralTexto: { color: tema.peligro, fontSize: 13, flex: 1 },
  });
}
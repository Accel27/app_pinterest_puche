import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CampoTexto from '../components/CampoTexto';
import BotonPrincipal from '../components/BotonPrincipal';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { AuthScreenProps } from '../navigation/types';
import {
  validarConfirmacion,
  validarEmail,
  validarNombreUsuario,
  validarPassword,
} from '../utils/validaciones';

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { registrar } = useApp();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<{
    nombre?: string | null;
    email?: string | null;
    password?: string | null;
    confirmacion?: string | null;
    general?: string | null;
  }>({});
  const [cargando, setCargando] = useState(false);

  function limpiarError(campo: keyof typeof errores) {
    setErrores((prev) => ({ ...prev, [campo]: null, general: null }));
  }

  async function enviar() {
    const eNombre = validarNombreUsuario(nombre);
    const eEmail = validarEmail(email);
    const ePassword = validarPassword(password);
    const eConfirmacion = validarConfirmacion(password, confirmacion);

    setErrores({
      nombre: eNombre,
      email: eEmail,
      password: ePassword,
      confirmacion: eConfirmacion,
      general: null,
    });

    if (eNombre || eEmail || ePassword || eConfirmacion) return;

    Keyboard.dismiss();
    setCargando(true);
    const r = await registrar(nombre, email, password);
    setCargando(false);
    if (!r.ok) {
      setErrores({ general: r.error ?? 'Error desconocido' });
    }
    // Si ok, el contexto setea usuarioActualId y RootNavigator cambia solo a AppStack.
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.encabezado}>
            <Ionicons
              name="arrow-back"
              size={26}
              color={tema.texto}
              onPress={() => navigation.goBack()}
            />
          </View>

          <View style={estilos.tituloContenedor}>
            <Text style={estilos.titulo}>Crear cuenta</Text>
            <Text style={estilos.subtitulo}>
              Únete a la comunidad y empieza a guardar ideas
            </Text>
          </View>

          <View style={estilos.formulario}>
            <CampoTexto
              label="Nombre de usuario"
              placeholder="tu_nombre"
              value={nombre}
              onChangeText={(t) => {
                setNombre(t);
                if (errores.nombre) limpiarError('nombre');
              }}
              error={errores.nombre}
            />

            <CampoTexto
              label="Email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errores.email) limpiarError('email');
              }}
              keyboardType="default"
              error={errores.email}
            />

            <CampoTexto
              label="Contraseña"
              placeholder="Mínimo 6 caracteres, letras y números"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errores.password) limpiarError('password');
                if (errores.confirmacion) limpiarError('confirmacion');
              }}
              esPassword
              error={errores.password}
            />

            <CampoTexto
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={confirmacion}
              onChangeText={(t) => {
                setConfirmacion(t);
                if (errores.confirmacion) limpiarError('confirmacion');
              }}
              esPassword
              error={errores.confirmacion}
            />

            {errores.general && (
              <View style={estilos.errorGeneral}>
                <Ionicons name="alert-circle" size={18} color={tema.peligro} />
                <Text style={estilos.errorGeneralTexto}>{errores.general}</Text>
              </View>
            )}

            <BotonPrincipal
              titulo="Crear cuenta"
              onPress={enviar}
              cargando={cargando}
            />

            <Text style={estilos.terminos}>
              Al crear una cuenta aceptas los términos y condiciones de uso.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: tema.fondo },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
    encabezado: { paddingTop: 12, paddingBottom: 8 },
    tituloContenedor: { marginBottom: 28 },
    titulo: { color: tema.texto, fontSize: 28, fontWeight: '700' },
    subtitulo: {
      color: tema.textoSuave,
      fontSize: 14,
      marginTop: 6,
      lineHeight: 20,
    },
    formulario: { flex: 1 },
    errorGeneral: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.primarioSuave,
      padding: 12,
      borderRadius: 10,
      gap: 8,
      marginBottom: 8,
    },
    errorGeneralTexto: { color: tema.peligro, fontSize: 13, flex: 1 },
    terminos: {
      color: tema.textoSuave,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 18,
    },
  });
}
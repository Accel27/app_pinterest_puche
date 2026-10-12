import { useState } from 'react';
import {
  Image,
  Keyboard,
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

import CampoTexto from '../components/CampoTexto';
import BotonPrincipal from '../components/BotonPrincipal';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { AuthScreenProps } from '../navigation/types';
import { validarEmail } from '../utils/validaciones';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    setErrorGeneral(null);
    const eEmail = validarEmail(email);
    const ePassword = password ? null : 'La contraseña es obligatoria';
    setErrorEmail(eEmail);
    setErrorPassword(ePassword);
    if (eEmail || ePassword) return;

    Keyboard.dismiss();
    setCargando(true);
    const r = await login(email, password);
    setCargando(false);
    if (!r.ok) setErrorGeneral(r.error ?? 'Error desconocido');
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
          <View style={estilos.logoContenedor}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={estilos.logoCirculo}
            resizeMode="contain"
          />
            <Text style={estilos.titulo}>Bienvenido a Tinterest</Text>
            <Text style={estilos.subtitulo}>Encuentra ideas para tu día a día</Text>
          </View>

          <View style={estilos.formulario}>
            <CampoTexto
              label="Email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorEmail) setErrorEmail(null);
                if (errorGeneral) setErrorGeneral(null);
              }}
              keyboardType="default"
              autoCapitalize="none"
              error={errorEmail}
            />

            <CampoTexto
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorPassword) setErrorPassword(null);
                if (errorGeneral) setErrorGeneral(null);
              }}
              esPassword
              error={errorPassword}
            />

            {errorGeneral && (
              <View style={estilos.errorGeneral}>
                <Ionicons name="alert-circle" size={18} color={tema.peligro} />
                <Text style={estilos.errorGeneralTexto}>{errorGeneral}</Text>
              </View>
            )}

            <BotonPrincipal
              titulo="Iniciar sesión"
              onPress={enviar}
              cargando={cargando}
            />

            <View style={estilos.separador}>
              <View style={estilos.linea} />
              <Text style={estilos.separadorTexto}>o</Text>
              <View style={estilos.linea} />
            </View>

            <BotonPrincipal
              titulo="Crear cuenta nueva"
              onPress={() => navigation.navigate('Register')}
              variante="secundario"
            />
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
    logoContenedor: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
    logoCirculo: {
      width: 125,
      height: 125,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    titulo: {
      color: tema.texto,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitulo: {
      color: tema.textoSuave,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 6,
    },
    formulario: { flex: 1, justifyContent: 'center' },
    errorGeneral: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.primarioSuave,
      padding: 12,
      borderRadius: 10,
      gap: 8,
      marginBottom: 8,
    },
    errorGeneralTexto: {
      color: tema.peligro,
      fontSize: 13,
      flex: 1,
    },
    separador: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    linea: { flex: 1, height: 1, backgroundColor: tema.borde },
    separadorTexto: {
      color: tema.textoSuave,
      marginHorizontal: 12,
      fontSize: 13,
    },
  });
}
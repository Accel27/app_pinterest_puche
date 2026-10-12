import { useMemo, useState } from 'react';
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
import { Usuario } from '../types';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { login, usuarios } = useApp();

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cuentasGuardadas = useMemo(() => usuarios.slice(0, 5), [usuarios]);
  const hayCuentasGuardadas = cuentasGuardadas.length > 0;

  async function iniciarSesion(mail: string, pass: string) {
    Keyboard.dismiss();
    setCargando(true);
    const r = await login(mail, pass);
    setCargando(false);
    if (!r.ok) setErrorGeneral(r.error ?? 'Error desconocido');
  }

  async function enviarFormularioCompleto() {
    setErrorGeneral(null);
    const eEmail = validarEmail(email);
    const ePassword = password ? null : 'La contraseña es obligatoria';
    setErrorEmail(eEmail);
    setErrorPassword(ePassword);
    if (eEmail || ePassword) return;
    await iniciarSesion(email, password);
  }

  async function enviarFormularioRapido() {
    setErrorGeneral(null);
    if (!password) {
      setErrorPassword('La contraseña es obligatoria');
      return;
    }
    if (!usuarioSeleccionado) return;
    await iniciarSesion(usuarioSeleccionado.email, password);
  }

  function elegirCuenta(u: Usuario) {
    setUsuarioSeleccionado(u);
    setPassword('');
    setErrorPassword(null);
    setErrorGeneral(null);
  }

  function volverAlFormularioCompleto() {
    setUsuarioSeleccionado(null);
    setPassword('');
    setErrorPassword(null);
    setErrorGeneral(null);
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
            <Text style={estilos.titulo}>
              {usuarioSeleccionado ? 'Bienvenido de nuevo' : 'Bienvenido a Tinterest'}
            </Text>
            <Text style={estilos.subtitulo}>
              {usuarioSeleccionado
                ? 'Ingresa tu contraseña para continuar'
                : 'Encuentra ideas para tu día a día'}
            </Text>
          </View>

          {usuarioSeleccionado ? (
            <View style={estilos.formulario}>
              {usuarioSeleccionado.avatar ? (
                <Image
                  source={{ uri: usuarioSeleccionado.avatar }}
                  style={estilos.avatarGrande}
                />
              ) : (
                <View
                  style={[
                    estilos.avatarGrande,
                    estilos.avatarGrandePlaceholder,
                    { backgroundColor: tema.primarioSuave },
                  ]}
                >
                  <Text style={[estilos.avatarGrandeInicial, { color: tema.primario }]}>
                    {usuarioSeleccionado.nombreUsuario.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={estilos.saludoRapido}>
                Hola, {usuarioSeleccionado.nombreUsuario}
              </Text>

              <View style={{ marginTop: 24 }}>
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
                  autoFocus
                />
              </View>

              {errorGeneral && (
                <View style={estilos.errorGeneral}>
                  <Ionicons name="alert-circle" size={18} color={tema.peligro} />
                  <Text style={estilos.errorGeneralTexto}>{errorGeneral}</Text>
                </View>
              )}

              <BotonPrincipal
                titulo="Iniciar sesión"
                onPress={enviarFormularioRapido}
                cargando={cargando}
              />

              <Pressable
                onPress={volverAlFormularioCompleto}
                style={estilos.botonCambiarCuenta}
              >
                <Text style={[estilos.botonCambiarCuentaTexto, { color: tema.primario }]}>
                  Usar otra cuenta
                </Text>
              </Pressable>
            </View>
          ) : (
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
                onPress={enviarFormularioCompleto}
                cargando={cargando}
              />

              {hayCuentasGuardadas && (
                <>
                  <View style={estilos.separador}>
                    <View style={estilos.linea} />
                    <Text style={estilos.separadorTexto}>cuentas guardadas</Text>
                    <View style={estilos.linea} />
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={estilos.cuentasScroll}
                  >
                    {cuentasGuardadas.map((u) => (
                      <Pressable
                        key={u.id}
                        onPress={() => elegirCuenta(u)}
                        style={estilos.cuentaItem}
                      >
                        {u.avatar ? (
                          <Image source={{ uri: u.avatar }} style={estilos.cuentaAvatar} />
                        ) : (
                          <View
                            style={[
                              estilos.cuentaAvatar,
                              estilos.cuentaAvatarPlaceholder,
                              { backgroundColor: tema.primarioSuave },
                            ]}
                          >
                            <Text
                              style={[
                                estilos.cuentaAvatarInicial,
                                { color: tema.primario },
                              ]}
                            >
                              {u.nombreUsuario.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <Text style={estilos.cuentaNombre} numberOfLines={1}>
                          {u.nombreUsuario}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              )}

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
          )}
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

    cuentasScroll: { gap: 16, paddingVertical: 4, paddingHorizontal: 4 },
    cuentaItem: { alignItems: 'center', width: 72 },
    cuentaAvatar: { width: 56, height: 56, borderRadius: 28 },
    cuentaAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    cuentaAvatarInicial: { fontSize: 22, fontWeight: '800' },
    cuentaNombre: {
      color: tema.texto,
      fontSize: 12,
      marginTop: 6,
      textAlign: 'center',
    },

    avatarGrande: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
      marginBottom: 4,
    },
    avatarGrandePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    avatarGrandeInicial: { fontSize: 40, fontWeight: '800' },
    saludoRapido: {
      color: tema.texto,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 12,
    },
    botonCambiarCuenta: {
      alignSelf: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    botonCambiarCuentaTexto: { fontSize: 14, fontWeight: '700' },
  });
}
import { useState } from 'react';
import {
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

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';

export default function CreateBoardScreen({
  navigation,
}: AppScreenProps<'CreateBoard'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { crearTablero } = useApp();

  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const puedeCrear = nombre.trim().length > 0 && !cargando;

  async function crear() {
    const limpio = nombre.trim();
    if (!limpio) {
      setError('El nombre es obligatorio');
      return;
    }
    if (limpio.length < 2) {
      setError('Mínimo 2 caracteres');
      return;
    }
    if (limpio.length > 40) {
      setError('Máximo 40 caracteres');
      return;
    }

    setCargando(true);
    const nuevo = await crearTablero(limpio);
    setCargando(false);

    if (nuevo) {
      navigation.goBack();
    } else {
      setError('No se pudo crear el tablero');
    }
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Nuevo tablero</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[estilos.iconoWrapper, { backgroundColor: tema.primarioSuave }]}>
            <Ionicons name="albums" size={42} color={tema.primario} />
          </View>

          <Text style={estilos.titulo}>Crea un tablero</Text>
          <Text style={estilos.subtitulo}>
            Los tableros te ayudan a organizar tus pins por tema o proyecto.
          </Text>

          <Text style={estilos.label}>Nombre del tablero</Text>
          <TextInput
            style={[estilos.input, error ? { borderColor: tema.peligro } : null]}
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              if (error) setError(null);
            }}
            placeholder="Ej: Inspiración de verano"
            placeholderTextColor={tema.textoSuave}
            maxLength={40}
            autoFocus
            onSubmitEditing={crear}
            returnKeyType="done"
          />
          {error && <Text style={estilos.errorTexto}>{error}</Text>}

          <Pressable
            onPress={crear}
            disabled={!puedeCrear}
            style={[
              estilos.boton,
              {
                backgroundColor: puedeCrear ? tema.primario : tema.superficieAlt,
              },
            ]}
          >
            <Text
              style={[
                estilos.botonTexto,
                { color: puedeCrear ? tema.textoInverso : tema.textoSuave },
              ]}
            >
              {cargando ? 'Creando...' : 'Crear tablero'}
            </Text>
          </Pressable>
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
    scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
    iconoWrapper: {
      width: 88,
      height: 88,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    titulo: {
      color: tema.texto,
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtitulo: {
      color: tema.textoSuave,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 32,
      lineHeight: 20,
      paddingHorizontal: 12,
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
      fontSize: 16,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    errorTexto: {
      color: tema.peligro,
      fontSize: 12,
      marginTop: 6,
      marginLeft: 4,
    },
    boton: {
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    botonTexto: { fontSize: 15, fontWeight: '700' },
  });
}
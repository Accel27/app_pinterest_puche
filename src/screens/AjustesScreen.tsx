import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { COLORES_PRINCIPALES, Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import { ModoTema } from '../types';

const MODOS: { valor: ModoTema; etiqueta: string; icono: keyof typeof Ionicons.glyphMap }[] = [
  { valor: 'claro', etiqueta: 'Claro', icono: 'sunny' },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: 'moon' },
  { valor: 'sistema', etiqueta: 'Sistema', icono: 'phone-portrait-outline' },
];

export default function AjustesScreen({ navigation }: AppScreenProps<'Ajustes'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { configuracion, setModoTema, setColorPrincipal } = useApp();

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo}>Ajustes</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={estilos.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={estilos.seccion}>Apariencia</Text>

        <View style={[estilos.card, { backgroundColor: tema.superficie }]}>
          {MODOS.map((m, i) => {
            const activo = configuracion.modoTema === m.valor;
            return (
              <Pressable
                key={m.valor}
                onPress={() => setModoTema(m.valor)}
                style={[
                  estilos.fila,
                  i < MODOS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: tema.borde,
                  },
                ]}
              >
                <View
                  style={[
                    estilos.iconoWrapper,
                    { backgroundColor: activo ? tema.primarioSuave : tema.superficieAlt },
                  ]}
                >
                  <Ionicons
                    name={m.icono}
                    size={20}
                    color={activo ? tema.primario : tema.textoSuave}
                  />
                </View>
                <Text style={estilos.filaTexto}>{m.etiqueta}</Text>
                {activo && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={tema.primario}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.ayuda}>
          {configuracion.modoTema === 'sistema'
            ? 'El tema sigue automáticamente la configuración de tu teléfono.'
            : `El tema está fijado en modo ${configuracion.modoTema}, sin importar lo que use el teléfono.`}
        </Text>

        <Text style={estilos.seccion}>Color principal</Text>

        <View style={[estilos.card, { backgroundColor: tema.superficie }]}>
          <View style={estilos.coloresGrid}>
            {COLORES_PRINCIPALES.map((c) => {
              const activo = configuracion.colorPrincipal === c.valor;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setColorPrincipal(c.valor)}
                  style={estilos.colorWrapper}
                >
                  <View
                    style={[
                      estilos.colorCirculo,
                      {
                        backgroundColor: c.valor,
                        borderWidth: activo ? 3 : 0,
                        borderColor: tema.texto,
                      },
                    ]}
                  >
                    {activo && (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text style={estilos.colorNombre}>{c.nombre}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={estilos.ayuda}>
          Este color se usa en botones, íconos activos y destacados de la app.
        </Text>
      </ScrollView>
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
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },
    seccion: {
      color: tema.texto,
      fontSize: 15,
      fontWeight: '800',
      marginTop: 20,
      marginBottom: 10,
      marginLeft: 4,
    },
    card: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    iconoWrapper: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filaTexto: {
      color: tema.texto,
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    ayuda: {
      color: tema.textoSuave,
      fontSize: 12,
      marginTop: 10,
      marginHorizontal: 4,
      lineHeight: 17,
    },
    coloresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 16,
    },
    colorWrapper: {
      alignItems: 'center',
      width: '20%',
    },
    colorCirculo: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorNombre: {
      color: tema.textoSuave,
      fontSize: 11,
      marginTop: 6,
      textAlign: 'center',
    },
  });
}
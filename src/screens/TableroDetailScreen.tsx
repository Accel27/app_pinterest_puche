import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { useApp } from '../context/AppContext';
import PinCard from '../components/PinCard';

const PADDING_H = 18;
const GAP = 14;

export default function TableroDetailScreen({
  route,
  navigation,
}: AppScreenProps<'TableroDetail'>) {
  const { tableroId } = route.params;
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { pins, tableros } = useApp();
  const { width } = useWindowDimensions();

  const anchoCard = (width - PADDING_H * 2 - GAP) / 2;

  const tablero = useMemo(
    () => tableros.find((t) => t.id === tableroId),
    [tableros, tableroId]
  );

  const pinsDelTablero = useMemo(
    () => pins.filter((p) => p.tableroId === tableroId),
    [pins, tableroId]
  );

  if (!tablero) {
    return (
      <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
        <View style={estilos.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={26} color={tema.texto} />
          </Pressable>
          <Text style={estilos.headerTitulo}>Tablero</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={estilos.centrado}>
          <Text style={{ color: tema.textoSuave }}>Este tablero ya no existe</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <View style={estilos.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={26} color={tema.texto} />
        </Pressable>
        <Text style={estilos.headerTitulo} numberOfLines={1}>
          {tablero.nombre}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {pinsDelTablero.length === 0 ? (
        <View style={estilos.centrado}>
          <Ionicons name="albums-outline" size={54} color={tema.textoSuave} />
          <Text style={estilos.vacioTitulo}>Tablero vacío</Text>
          <Text style={estilos.vacioTexto}>
            Guarda pins aquí desde el detalle de cualquier pin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pinsDelTablero}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PinCard
              pin={item}
              ancho={anchoCard}
              onPress={() =>
                navigation.navigate('PinDetail', { pinId: item.id })
              }
            />
          )}
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
      gap: 12,
    },
    headerTitulo: {
      color: tema.texto,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    centrado: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 8,
    },
    vacioTitulo: {
      color: tema.texto,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 8,
    },
    vacioTexto: {
      color: tema.textoSuave,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    lista: { paddingHorizontal: PADDING_H, paddingTop: 12, paddingBottom: 24 },
  });
}
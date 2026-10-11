import { useMemo, useState } from 'react';
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

import PinCard from '../components/PinCard';
import Buscador from '../components/Buscador';
import ChipsCategorias from '../components/ChipsCategorias';
import { useApp } from '../context/AppContext';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';
import { Categoria } from '../types';
import { ETIQUETA_CATEGORIA } from '../storage/seed';
import { TabScreenProps } from '../navigation/types';

const PADDING_H = 18;
const GAP = 14;

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { pins, usuarios, notificaciones, usuarioActual } = useApp();
  const { width } = useWindowDimensions();

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  const anchoCard = (width - PADDING_H * 2 - GAP) / 2;

  const noLeidas = usuarioActual
    ? notificaciones.filter((n) => n.usuarioDestinoId === usuarioActual.id && !n.leida).length
    : 0;

  const pinsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pins.filter((pin) => {
      if (categoria && pin.categoria !== categoria) return false;
      if (!q) return true;

      const autor = usuarios.find((u) => u.id === pin.autorId);
      const nombreAutor = (autor?.nombreUsuario ?? '').toLowerCase();
      const etiquetaCat = ETIQUETA_CATEGORIA[pin.categoria].toLowerCase();

      return (
        pin.titulo.toLowerCase().includes(q) ||
        pin.descripcion.toLowerCase().includes(q) ||
        etiquetaCat.includes(q) ||
        nombreAutor.includes(q)
      );
    });
  }, [pins, usuarios, busqueda, categoria]);

  function limpiarFiltros() {
    setBusqueda('');
    setCategoria(null);
  }

  const sinResultados = pinsFiltrados.length === 0;

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <View style={estilos.header}>
        <Text style={estilos.marca}>Pinterest</Text>
        <Pressable
          onPress={() => navigation.navigate('Notificaciones')}
          hitSlop={10}
          style={estilos.campana}
          android_ripple={{ color: 'transparent', borderless: true }}
        >
          <Ionicons name="notifications-outline" size={26} color={tema.texto} />
          {noLeidas > 0 && (
            <View style={estilos.badge}>
              <Text style={estilos.badgeTexto}>{noLeidas > 99 ? '99+' : noLeidas}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={estilos.busquedaWrapper}>
        <Buscador
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar pins, categorías o personas"
        />
      </View>

      <View style={estilos.chipsWrapper}>
        <ChipsCategorias seleccionada={categoria} onSeleccionar={setCategoria} />
      </View>

      <FlatList
        data={pinsFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PinCard
            pin={item}
            ancho={anchoCard}
            onPress={() => navigation.navigate('PinDetail', { pinId: item.id })}
          />
        )}
        ListEmptyComponent={
          sinResultados ? (
            <View style={estilos.vacio}>
              <Ionicons name="search-outline" size={48} color={tema.textoSuave} />
              <Text style={estilos.vacioTitulo}>Sin resultados</Text>
              <Text style={estilos.vacioTexto}>
                {busqueda || categoria
                  ? 'Prueba con otra búsqueda o categoría'
                  : 'Todavía no hay pins. Crea el primero.'}
              </Text>
              {(busqueda || categoria) && (
                <Pressable onPress={limpiarFiltros} style={estilos.botonLimpiar}>
                  <Text style={[estilos.botonLimpiarTexto, { color: tema.primario }]}>
                    Limpiar filtros
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
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
      paddingTop: 8,
      paddingBottom: 4,
    },
    marca: {
      color: tema.primario,
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    campana: { position: 'relative', padding: 4 },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: tema.primario,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeTexto: {
      color: tema.textoInverso,
      fontSize: 10,
      fontWeight: '700',
    },
    busquedaWrapper: { paddingHorizontal: 16, paddingTop: 8 },
    chipsWrapper: { paddingLeft: 16, paddingTop: 12, paddingBottom: 4 },
    lista: { paddingHorizontal: PADDING_H, paddingTop: 12, paddingBottom: 24 },
    vacio: {
      alignItems: 'center',
      paddingTop: 60,
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
    botonLimpiar: { marginTop: 12, padding: 10 },
    botonLimpiarTexto: { fontSize: 14, fontWeight: '700' },
  });
}
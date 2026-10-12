import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Pin } from '../types';
import { Tema } from '../theme/tema';
import { useTema } from '../theme/hooks';
import { fuenteImagen } from '../storage/seed';
import { useApp } from '../context/AppContext';

interface Props {
  pin: Pin;
  ancho: number;
  onPress: () => void;
}

function aspectRatioDesdeId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  // Rango 0.6 (vertical) a 1.1 (casi cuadrado). Más vertical que antes
  // para que las fotos verticales no se recorten tanto.
  return 0.6 + ((hash % 100) / 100) * 0.5;
}

export default function PinCard({ pin, ancho, onPress }: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const { usuarioActual, toggleLike, usuarios } = useApp();

  const aspectRatio = useMemo(
  () => pin.aspectRatio ?? aspectRatioDesdeId(pin.id),
  [pin.aspectRatio, pin.id]
  );
  const alto = ancho / aspectRatio;
  const fuente = useMemo(() => fuenteImagen(pin.imagen), [pin.imagen]);
  const likeado = usuarioActual ? pin.likes.includes(usuarioActual.id) : false;

  const autor = useMemo(
    () => usuarios.find((u) => u.id === pin.autorId),
    [usuarios, pin.autorId]
  );
  const nombreAutor = autor?.nombreUsuario ?? 'Tinterest';

  return (
    <Pressable style={estilos.contenedor} onPress={onPress}>
      <View style={[estilos.imagenWrapper, { width: ancho, height: alto }]}>
        <Image
          source={fuente}
          style={estilos.imagen}
          resizeMode="cover"
        />
        <Pressable
          onPress={() => toggleLike(pin.id)}
          hitSlop={8}
          style={estilos.botonLike}
          android_ripple={{ color: 'transparent', borderless: true }}
        >
          <Ionicons
            name={likeado ? 'heart' : 'heart-outline'}
            size={20}
            color={likeado ? tema.primario : '#FFFFFF'}
          />
        </Pressable>
      </View>
      <Text style={estilos.titulo} numberOfLines={2}>
        {pin.titulo}
      </Text>
      <View style={estilos.filaInferior}>
        {!pin.esSeed && (
          <Text style={estilos.autor} numberOfLines={1}>
            {nombreAutor}
          </Text>
        )}
        {pin.likes.length > 0 && (
          <Text style={estilos.likes}>{pin.likes.length}</Text>
        )}
      </View>
    </Pressable>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { marginBottom: 18 },
    imagenWrapper: { position: 'relative' },
    imagen: {
      width: '100%',
      height: '100%',
      borderRadius: 18,
      backgroundColor: tema.superficie,
    },
    botonLike: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: {
      color: tema.texto,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 8,
      lineHeight: 17,
    },
    filaInferior: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    autor: {
      color: tema.textoSuave,
      fontSize: 11,
      flex: 1,
    },
    likes: {
      color: tema.textoSuave,
      fontSize: 11,
      marginLeft: 4,
    },
  });
}
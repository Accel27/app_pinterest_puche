import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Comentario, Usuario } from '../types';
import { Tema } from '../theme/tema';
import { useTema } from '../theme/hooks';
import { formatearFecha } from '../utils/fechas';

interface Props {
  comentario: Comentario;
  autor: Usuario | undefined;
  puedeEliminar: boolean;
  onEliminar: () => void;
}

export default function ComentarioItem({
  comentario,
  autor,
  puedeEliminar,
  onEliminar,
}: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  const inicial = (autor?.nombreUsuario ?? '?').charAt(0).toUpperCase();

  return (
    <View style={estilos.contenedor}>
      <View style={[estilos.avatar, { backgroundColor: tema.primarioSuave }]}>
        <Text style={[estilos.avatarTexto, { color: tema.primario }]}>{inicial}</Text>
      </View>
      <View style={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Text style={estilos.nombre} numberOfLines={1}>
            {autor?.nombreUsuario ?? 'Usuario eliminado'}
          </Text>
          <Text style={estilos.fecha}>{formatearFecha(comentario.creadoEn)}</Text>
        </View>
        <Text style={estilos.texto}>{comentario.texto}</Text>
      </View>
      {puedeEliminar && (
        <Pressable onPress={onEliminar} hitSlop={8} style={estilos.botonEliminar}>
          <Ionicons name="trash-outline" size={18} color={tema.textoSuave} />
        </Pressable>
      )}
    </View>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 4,
      gap: 12,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTexto: { fontSize: 15, fontWeight: '700' },
    contenido: { flex: 1 },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    nombre: {
      color: tema.texto,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
    },
    fecha: { color: tema.textoSuave, fontSize: 11, marginLeft: 8 },
    texto: {
      color: tema.texto,
      fontSize: 14,
      lineHeight: 19,
    },
    botonEliminar: { padding: 4 },
  });
}
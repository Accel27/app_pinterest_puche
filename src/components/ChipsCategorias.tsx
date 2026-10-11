import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Categoria } from '../types';
import { CATEGORIAS, ETIQUETA_CATEGORIA } from '../storage/seed';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';

interface Props {
  seleccionada: Categoria | null;
  onSeleccionar: (categoria: Categoria | null) => void;
  incluirTodas?: boolean;
}

export default function ChipsCategorias({
  seleccionada,
  onSeleccionar,
  incluirTodas = true,
}: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  const opciones: { valor: Categoria | null; etiqueta: string }[] = incluirTodas
    ? [
        { valor: null, etiqueta: 'Todas' },
        ...CATEGORIAS.map((c) => ({ valor: c, etiqueta: ETIQUETA_CATEGORIA[c] })),
      ]
    : CATEGORIAS.map((c) => ({ valor: c, etiqueta: ETIQUETA_CATEGORIA[c] }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenedor}
    >
      {opciones.map((op) => {
        const activo = seleccionada === op.valor;
        return (
          <Pressable
            key={op.etiqueta}
            onPress={() => onSeleccionar(op.valor)}
            style={[
              estilos.chip,
              activo ? estilos.chipActivo : estilos.chipInactivo,
            ]}
          >
            <Text
              style={[
                estilos.chipTexto,
                { color: activo ? tema.textoInverso : tema.texto },
              ]}
            >
              {op.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { paddingVertical: 4, gap: 8 },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      marginRight: 8,
    },
    chipActivo: { backgroundColor: tema.primario },
    chipInactivo: { backgroundColor: tema.superficie },
    chipTexto: { fontSize: 13, fontWeight: '600' },
  });
}
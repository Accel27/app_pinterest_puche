import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';

export type TabInterno = 'pins' | 'tableros' | 'liked';

interface Props {
  activo: TabInterno;
  onChange: (t: TabInterno) => void;
  counts: { pins: number; tableros: number; liked: number };
}

const OPCIONES: { valor: TabInterno; etiqueta: string }[] = [
  { valor: 'pins', etiqueta: 'Mis Pins' },
  { valor: 'tableros', etiqueta: 'Tableros' },
  { valor: 'liked', etiqueta: 'Me gusta' },
];

export default function TabsInternos({ activo, onChange, counts }: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  return (
    <View style={[estilos.contenedor, { borderBottomColor: tema.borde }]}>
      {OPCIONES.map((op) => {
        const estaActivo = activo === op.valor;
        const count = counts[op.valor];
        return (
          <Pressable
            key={op.valor}
            onPress={() => onChange(op.valor)}
            style={estilos.boton}
          >
            <Text
              style={[
                estilos.etiqueta,
                { color: estaActivo ? tema.texto : tema.textoSuave },
              ]}
            >
              {op.etiqueta} {count > 0 ? `· ${count}` : ''}
            </Text>
            {estaActivo && (
              <View style={[estilos.indicador, { backgroundColor: tema.primario }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      marginTop: 16,
    },
    boton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      position: 'relative',
    },
    etiqueta: { fontSize: 13, fontWeight: '700' },
    indicador: {
      position: 'absolute',
      bottom: -1,
      height: 3,
      width: '60%',
      borderRadius: 2,
    },
  });
}
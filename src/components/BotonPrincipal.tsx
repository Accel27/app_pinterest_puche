import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';

interface Props {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario';
}

export default function BotonPrincipal({
  titulo,
  onPress,
  cargando,
  deshabilitado,
  variante = 'primario',
}: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const bloqueado = deshabilitado || cargando;

  const esSecundario = variante === 'secundario';

  return (
    <Pressable
      onPress={bloqueado ? undefined : onPress}
      style={({ pressed }) => [
        estilos.boton,
        esSecundario ? estilos.secundario : estilos.primario,
        bloqueado && estilos.bloqueado,
        pressed && !bloqueado && estilos.presionado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={esSecundario ? tema.primario : tema.textoInverso} />
      ) : (
        <Text
          style={[
            estilos.texto,
            { color: esSecundario ? tema.primario : tema.textoInverso },
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    boton: {
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    primario: { backgroundColor: tema.primario },
    secundario: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: tema.primario,
    },
    bloqueado: { opacity: 0.5 },
    presionado: { opacity: 0.85 },
    texto: { fontSize: 15, fontWeight: '700' },
  });
}
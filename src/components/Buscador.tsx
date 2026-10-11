import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';

interface Props {
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
}

export default function Buscador({
  valor,
  onChange,
  placeholder = 'Buscar ideas',
}: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="search" size={20} color={tema.textoSuave} />
      <TextInput
        style={estilos.input}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={tema.textoSuave}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {valor.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={tema.textoSuave} />
        </Pressable>
      )}
    </View>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.superficie,
      borderRadius: 24,
      paddingHorizontal: 16,
      height: 46,
      gap: 10,
    },
    input: {
      flex: 1,
      color: tema.texto,
      fontSize: 15,
      paddingVertical: 0,
    },
  });
}
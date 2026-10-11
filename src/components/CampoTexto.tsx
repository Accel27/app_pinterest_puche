import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../theme/hooks';
import { Tema } from '../theme/tema';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  esPassword?: boolean;
}

export default function CampoTexto({ label, error, esPassword, style, ...rest }: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);
  const [verPassword, setVerPassword] = useState(false);

  const tieneError = !!error;

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>{label}</Text>
      <View style={[estilos.inputWrapper, tieneError && estilos.inputError]}>
        <TextInput
          {...rest}
          style={[estilos.input, style]}
          placeholderTextColor={tema.textoSuave}
          secureTextEntry={esPassword && !verPassword}
          autoCapitalize={rest.autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {esPassword && (
          <Pressable onPress={() => setVerPassword((v) => !v)} hitSlop={10} style={estilos.ojo}>
            <Ionicons
              name={verPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={tema.textoSuave}
            />
          </Pressable>
        )}
      </View>
      {tieneError && <Text style={estilos.error}>{error}</Text>}
    </View>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    contenedor: { marginBottom: 16 },
    label: {
      color: tema.textoSuave,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tema.superficie,
      borderWidth: 1,
      borderColor: tema.borde,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    inputError: { borderColor: tema.peligro },
    input: {
      flex: 1,
      color: tema.texto,
      fontSize: 15,
      paddingVertical: 14,
    },
    ojo: { paddingLeft: 8, paddingVertical: 4 },
    error: {
      color: tema.peligro,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
}
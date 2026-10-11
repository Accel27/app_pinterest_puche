import { Text, View, Pressable } from 'react-native';
import { useApp, } from '../context/AppContext';
import { useTema } from '../theme/hooks';

export default function ProfileScreen() {
  const tema = useTema();
  const { usuarioActual, logout } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ color: tema.texto, fontSize: 20 }}>Hola {usuarioActual?.nombreUsuario}</Text>
      <Pressable
        onPress={logout}
        style={{ padding: 12, backgroundColor: tema.primario, borderRadius: 8 }}
      >
        <Text style={{ color: tema.textoInverso }}>Cerrar sesión (temporal)</Text>
      </Pressable>
    </View>
  );
}
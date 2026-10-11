import { Text, View } from 'react-native';
import { useTema } from '../theme/hooks';

export default function CreateBoardScreen() {
  const tema = useTema();
  return (
    <View style={{ flex: 1, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: tema.texto }}>Create Board (placeholder)</Text>
    </View>
  );
}
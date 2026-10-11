import { Text, View } from 'react-native';
import { AppScreenProps } from '../navigation/types';
import { useTema } from '../theme/hooks';

export default function PinDetailScreen({ route }: AppScreenProps<'PinDetail'>) {
  const tema = useTema();
  return (
    <View style={{ flex: 1, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: tema.texto }}>Pin detail: {route.params.pinId}</Text>
    </View>
  );
}
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PinDetailScreen from '../screens/PinDetailScreen';
import AddPinScreen from '../screens/AddPinScreen';
import CreateBoardScreen from '../screens/CreateBoardScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import BottomTabs from './BottomTabs';
import { AppStackParamList, AuthStackParamList } from './types';
import { useApp } from '../context/AppContext';
import { useTema } from '../theme/hooks';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={BottomTabs} />
      <AppStack.Screen
        name="PinDetail"
        component={PinDetailScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen
        name="AddPin"
        component={AddPinScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen
        name="CreateBoard"
        component={CreateBoardScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen
        name="Notificaciones"
        component={NotificacionesScreen}
        options={{ presentation: 'modal' }}
      />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const { cargando, usuarioActual } = useApp();
  const tema = useTema();

  const navTheme = tema.modo === 'oscuro'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: tema.fondo, card: tema.superficie, primary: tema.primario, text: tema.texto, border: tema.borde } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: tema.fondo, card: tema.superficie, primary: tema.primario, text: tema.texto, border: tema.borde } };

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={tema.primario} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {usuarioActual ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
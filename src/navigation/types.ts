import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  PinDetail: { pinId: string };
  AddPin: { tableroIdInicial?: string | null } | undefined;
  CreateBoard: undefined;
  Notificaciones: undefined;
  EditarPerfil: undefined;
  TableroDetail: { tableroId: string };
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

// Permite usar navigation.navigate('PinDetail', ...) desde dentro de un Tab
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<AppStackParamList>
>;
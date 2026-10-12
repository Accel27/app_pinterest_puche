import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Tablero } from '../types';
import { Tema } from '../theme/tema';
import { useTema } from '../theme/hooks';

interface Props {
  visible: boolean;
  titulo?: string;
  tableros: Tablero[];
  tableroActualId: string | null;
  onCerrar: () => void;
  onSeleccionar: (tableroId: string | null) => void;
  onCrearTablero: (nombre: string) => Promise<void>;
}

export default function ModalSelectorTablero({
  visible,
  titulo = 'Elegir tablero',
  tableros,
  tableroActualId,
  onCerrar,
  onSeleccionar,
  onCrearTablero,
}: Props) {
  const tema = useTema();
  const estilos = crearEstilos(tema);

  const [modoCrear, setModoCrear] = useState(false);
  const [nombre, setNombre] = useState('');
  const [creando, setCreando] = useState(false);

  function cerrar() {
    setModoCrear(false);
    setNombre('');
    onCerrar();
  }

  async function crear() {
    const limpio = nombre.trim();
    if (!limpio) return;
    setCreando(true);
    await onCrearTablero(limpio);
    setCreando(false);
    setNombre('');
    setModoCrear(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={cerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.kav}
      >
        <Pressable style={estilos.fondo} onPress={cerrar}>
          <Pressable style={estilos.hoja} onPress={() => {}}>
            <View style={estilos.manija} />

            <View style={estilos.encabezado}>
              <Text style={estilos.titulo}>
                {modoCrear ? 'Nuevo tablero' : titulo}
              </Text>
              <Pressable onPress={cerrar} hitSlop={8}>
                <Ionicons name="close" size={24} color={tema.texto} />
              </Pressable>
            </View>

            {modoCrear ? (
              <View style={estilos.crearWrapper}>
                <TextInput
                  style={estilos.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Nombre del tablero"
                  placeholderTextColor={tema.textoSuave}
                  selectionColor={tema.primario}
                  cursorColor={tema.primario}
                  autoFocus
                  maxLength={40}
                  onSubmitEditing={crear}
                />
                <View style={estilos.botonesCrear}>
                  <Pressable
                    onPress={() => {
                      setModoCrear(false);
                      setNombre('');
                    }}
                    style={[estilos.botonCrear, { backgroundColor: tema.superficie }]}
                  >
                    <Text style={[estilos.botonCrearTexto, { color: tema.texto }]}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={crear}
                    disabled={!nombre.trim() || creando}
                    style={[
                      estilos.botonCrear,
                      {
                        backgroundColor: nombre.trim()
                          ? tema.primario
                          : tema.superficieAlt,
                      },
                    ]}
                  >
                    {creando ? (
                      <ActivityIndicator size="small" color={tema.textoInverso} />
                    ) : (
                      <Text
                        style={[
                          estilos.botonCrearTexto,
                          {
                            color: nombre.trim() ? tema.textoInverso : tema.textoSuave,
                          },
                        ]}
                      >
                        Crear
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <ScrollView
                  style={{ maxHeight: 340 }}
                  showsVerticalScrollIndicator={false}
                >
                  {tableros.length === 0 ? (
                    <View style={estilos.vacio}>
                      <Ionicons name="albums-outline" size={36} color={tema.textoSuave} />
                      <Text style={estilos.vacioTexto}>
                        Todavía no tienes tableros
                      </Text>
                    </View>
                  ) : (
                    tableros.map((t) => {
                      const activo = t.id === tableroActualId;
                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => onSeleccionar(t.id)}
                          style={estilos.fila}
                        >
                          <View
                            style={[
                              estilos.iconoFila,
                              { backgroundColor: tema.superficieAlt },
                            ]}
                          >
                            <Ionicons name="albums" size={20} color={tema.primario} />
                          </View>
                          <Text style={estilos.nombreTablero} numberOfLines={1}>
                            {t.nombre}
                          </Text>
                          {activo && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={tema.primario}
                            />
                          )}
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>

                <Pressable
                  onPress={() => setModoCrear(true)}
                  style={[estilos.botonNuevo, { borderTopColor: tema.borde }]}
                >
                  <Ionicons name="add-circle-outline" size={22} color={tema.primario} />
                  <Text style={[estilos.botonNuevoTexto, { color: tema.primario }]}>
                    Crear tablero nuevo
                  </Text>
                </Pressable>

                {tableroActualId && (
                  <Pressable
                    onPress={() => onSeleccionar(null)}
                    style={estilos.botonQuitar}
                  >
                    <Text style={[estilos.botonQuitarTexto, { color: tema.peligro }]}>
                      Quitar del tablero
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function crearEstilos(tema: Tema) {
  return StyleSheet.create({
    kav: { flex: 1 },
    fondo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    hoja: {
      backgroundColor: tema.fondo,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingBottom: 20,
    },
    manija: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: tema.borde,
      marginBottom: 12,
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    titulo: { color: tema.texto, fontSize: 18, fontWeight: '700' },
    vacio: { alignItems: 'center', paddingVertical: 32, gap: 8 },
    vacioTexto: { color: tema.textoSuave, fontSize: 14 },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    iconoFila: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nombreTablero: { color: tema.texto, fontSize: 15, fontWeight: '600', flex: 1 },
    botonNuevo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      marginTop: 8,
      borderTopWidth: 1,
      gap: 8,
    },
    botonNuevoTexto: { fontSize: 15, fontWeight: '700' },
    botonQuitar: { alignItems: 'center', paddingVertical: 12 },
    botonQuitarTexto: { fontSize: 14, fontWeight: '600' },
    crearWrapper: { paddingHorizontal: 20, gap: 16 },
    input: {
      color: tema.texto,
      backgroundColor: tema.superficie,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
    },
    botonesCrear: { flexDirection: 'row', gap: 10 },
    botonCrear: {
      flex: 1,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonCrearTexto: { fontSize: 14, fontWeight: '700' },
  });
}
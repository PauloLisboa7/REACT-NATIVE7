import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getAllUsers,
  deleteUser as deleteUserFromFirestore,
  updateUser,
  UserData,
} from '../services/firebaseFirestoreService';
import { verifyPassword } from '../services/firebaseAuthService';
import { logActivity } from '../services/firebaseActivityService';
import { exportUsersAsCSV, exportUsersAsJSON, shareExportedFile } from '../services/exportService';
import { sendLocalNotification } from '../services/notificationService';

export default function ListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UserData[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [usuarioBiometria, setUsuarioBiometria] = useState<string | null>(null);
  const [filtroRole, setFiltroRole] = useState<string | null>(null);
  const [filtroFavoritos, setFiltroFavoritos] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });

    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
      carregarUsuarioBiometria();
    });

    carregarDados();
    carregarUsuarioBiometria();

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    let filtrados = usuarios;

    if (searchText.trim() !== '') {
      filtrados = filtrados.filter(
        (u) =>
          u.name.toLowerCase().includes(searchText.toLowerCase()) ||
          u.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filtroRole) {
      filtrados = filtrados.filter((u) => u.role === filtroRole);
    }

    if (filtroFavoritos) {
      filtrados = filtrados.filter((u) => u.isFavorite === true);
    }

    setUsuariosFiltrados(filtrados);
  }, [searchText, usuarios, filtroRole, filtroFavoritos]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const usuariosFirebase = await getAllUsers();
      setUsuarios(usuariosFirebase);
    } catch (erro: any) {
      console.error('Erro ao carregar usuários:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setCarregando(false);
    }
  };

  const carregarUsuarioBiometria = async () => {
    try {
      const emailSalvo = await AsyncStorage.getItem('biometryUser');
      setUsuarioBiometria(emailSalvo);
    } catch (erro) {
      console.error('Erro ao carregar usuário biométrico:', erro);
    }
  };

  const definirUsuarioBiometria = async (uid: string, email: string) => {
    try {
      if (usuarioBiometria === uid) {
        await AsyncStorage.removeItem('biometryUser');
        await AsyncStorage.removeItem('biometryUserId');
        await AsyncStorage.removeItem(`biometry_password_${email}`);
        setUsuarioBiometria(null);
        Alert.alert(t('common.success'), t('screens.list.biometryDisabled'));
      } else {
        Alert.prompt(
          t('screens.list.confirmPassword'),
          t('screens.list.biometryPasswordPrompt'),
          [
            { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
            {
              text: t('screens.list.enable'),
              onPress: async (senha) => {
                if (!senha) {
                  Alert.alert(t('common.error'), t('screens.list.passwordEmpty'));
                  return;
                }

                try {
                  const senhaCorreta = await verifyPassword(email, senha);
                  if (!senhaCorreta) {
                    Alert.alert(t('common.error'), t('screens.list.wrongPassword'));
                    return;
                  }

                  await AsyncStorage.setItem('biometryUser', email);
                  await AsyncStorage.setItem('biometryUserId', uid);
                  await AsyncStorage.setItem(`biometry_password_${email}`, senha);
                  setUsuarioBiometria(uid);
                  Alert.alert(t('common.success'), t('screens.list.biometryEnabled'));
                } catch (erro) {
                  Alert.alert(t('common.error'), t('screens.list.saveBiometryError'));
                }
              },
            },
          ],
          'secure-text'
        );
      }
    } catch (erro) {
      Alert.alert(t('common.error'), t('screens.list.biometryError'));
    }
  };

  const toggleFavorito = async (usuario: UserData) => {
    try {
      const novoStatus = !usuario.isFavorite;
      const usuarioAtualizado = {
        ...usuario,
        isFavorite: novoStatus,
        updatedAt: new Date().getTime(),
      };

      await updateUser(usuario.uid, usuarioAtualizado);
      setUsuarios(usuarios.map((u) => (u.uid === usuario.uid ? usuarioAtualizado : u)));

      if (user) {
        await logActivity(
          user.uid,
          'favorite',
          `Usuário ${novoStatus ? 'adicionado aos' : 'removido dos'} favoritos`,
          usuario.uid
        );
      }

      await sendLocalNotification({
        title: novoStatus ? t('screens.list.addedToFavorites') : t('screens.list.removedFromFavorites'),
        body: `${usuario.name} foi ${novoStatus ? 'adicionado' : 'removido'}`,
      });
    } catch (erro) {
      Alert.alert(t('common.error'), t('screens.list.updateFavoriteError'));
    }
  };

  const iniciarEdicaoInline = (usuario: UserData) => {
    setEditingId(usuario.uid);
    setEditingValue(usuario.name);
  };

  const salvarEdicaoInline = async (usuario: UserData) => {
    if (editingValue.trim() === '') {
      Alert.alert(t('common.error'), t('screens.list.nameEmpty'));
      return;
    }

    try {
      const usuarioAtualizado = {
        ...usuario,
        name: editingValue,
        updatedAt: new Date().getTime(),
      };

      await updateUser(usuario.uid, usuarioAtualizado);
      setUsuarios(usuarios.map((u) => (u.uid === usuario.uid ? usuarioAtualizado : u)));

      if (user) {
        await logActivity(user.uid, 'update', `Nome atualizado para ${editingValue}`, usuario.uid);
      }

      setEditingId(null);
      setEditingValue('');
      Alert.alert(t('common.success'), t('messages.updatedSuccessfully'));
    } catch (erro) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const deletarUsuario = async (uid: string, email: string) => {
    Alert.prompt(
      t('common.delete'),
      t('screens.list.passwordVerification'),
      [
        { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('common.delete'),
          onPress: async (senha) => {
            if (!senha) {
              Alert.alert(t('common.error'), t('common.error'));
              return;
            }

            try {
              const senhaCorreta = await verifyPassword(email, senha);
              if (!senhaCorreta) {
                Alert.alert(t('common.error'), t('common.error'));
                return;
              }

              await deleteUserFromFirestore(uid);
              setUsuarios(usuarios.filter((u) => u.uid !== uid));

              if (user) {
                await logActivity(user.uid, 'delete', `Usuário ${email} deletado`, uid);
              }

              const usuarioBioSalvo = await AsyncStorage.getItem('biometryUser');
              if (usuarioBioSalvo === email) {
                await AsyncStorage.removeItem('biometryUser');
                await AsyncStorage.removeItem('biometryUserId');
                await AsyncStorage.removeItem(`biometry_password_${email}`);
              }

              Alert.alert(t('common.success'), t('messages.deletedSuccessfully'));
            } catch (erro: any) {
              Alert.alert(t('common.error'), erro.message || t('common.error'));
            }
          },
          style: 'destructive',
        },
      ],
      'secure-text'
    );
  };

  const exportarDados = async () => {
    Alert.alert(t('screens.list.export'), t('common.loading'), [
      { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
      {
        text: 'CSV',
        onPress: async () => {
          try {
            const filePath = await exportUsersAsCSV(usuariosFiltrados);
            await shareExportedFile(filePath, 'usuarios.csv');

            if (user) {
              await logActivity(user.uid, 'export', 'Dados exportados em CSV', user.uid);
            }

            await sendLocalNotification({
              title: t('screens.list.export'),
              body: t('messages.savedSuccessfully'),
            });
          } catch (erro) {
            Alert.alert(t('common.error'), t('common.error'));
          }
        },
      },
      {
        text: 'JSON',
        onPress: async () => {
          try {
            const filePath = await exportUsersAsJSON(usuariosFiltrados);
            await shareExportedFile(filePath, 'usuarios.json');

            if (user) {
              await logActivity(user.uid, 'export', 'Dados exportados em JSON', user.uid);
            }

            await sendLocalNotification({
              title: t('screens.list.export'),
              body: t('messages.savedSuccessfully'),
            });
          } catch (erro) {
            Alert.alert(t('common.error'), t('common.error'));
          }
        },
      },
    ]);
  };

  const styles = createStyles(colors);

  const renderizarUsuario = ({ item }: { item: UserData }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardContent}>
        {editingId === item.uid ? (
          <View style={styles.editingContainer}>
            <TextInput
              style={[styles.editingInput, { color: colors.text, borderColor: colors.primary }]}
              value={editingValue}
              onChangeText={setEditingValue}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => salvarEdicaoInline(item)}
              style={[styles.saveButton, { backgroundColor: colors.success }]}
            >
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingId(null);
                setEditingValue('');
              }}
              style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
            >
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => iniciarEdicaoInline(item)}>
              <Text style={[styles.cardNome, { color: colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
            <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t('screens.list.email')}:</Text> {item.email}
            </Text>
            <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t('screens.list.age')}:</Text> {item.age} {t('screens.list.yearsOld')}
            </Text>
            {item.role && (
              <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
                <Text style={[styles.label, { color: colors.text }]}>{t('screens.list.role')}:</Text> {item.role}
              </Text>
            )}
            <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t('screens.list.registeredAt')}:</Text>{' '}
              {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.botaoFavorito, item.isFavorite && { backgroundColor: colors.danger }]}
          onPress={() => toggleFavorito(item)}
        >
          <MaterialCommunityIcons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={item.isFavorite ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botaoBiometria,
            usuarioBiometria === item.uid && { backgroundColor: colors.success },
          ]}
          onPress={() => definirUsuarioBiometria(item.uid, item.email)}
        >
          <MaterialCommunityIcons
            name={usuarioBiometria === item.uid ? 'fingerprint' : 'fingerprint-off'}
            size={18}
            color={usuarioBiometria === item.uid ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoDeletar, { backgroundColor: colors.danger }]}
          onPress={() => deletarUsuario(item.uid, item.email)}
        >
          <MaterialCommunityIcons name="trash-can" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (carregando) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colors.text }]}>{t('screens.list.title')}</Text>
        <Text style={[styles.contador, { color: colors.textSecondary }]}>
          {usuariosFiltrados.length} de {usuarios.length}
        </Text>
      </View>

      <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('screens.list.search')}
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.filtersContainer, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroFavoritos && { backgroundColor: colors.danger },
            !filtroFavoritos && { backgroundColor: colors.surfaceSecondary },
          ]}
          onPress={() => setFiltroFavoritos(!filtroFavoritos)}
        >
          <MaterialCommunityIcons
            name="heart"
            size={16}
            color={filtroFavoritos ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroRole === 'admin' && { backgroundColor: colors.primary },
            filtroRole !== 'admin' && { backgroundColor: colors.surfaceSecondary },
          ]}
          onPress={() => setFiltroRole(filtroRole === 'admin' ? null : 'admin')}
        >
          <MaterialCommunityIcons
            name="shield-account"
            size={16}
            color={filtroRole === 'admin' ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {usuariosFiltrados.length > 0 ? (
        <FlatList
          data={usuariosFiltrados}
          renderItem={renderizarUsuario}
          keyExtractor={(item) => item.uid}
          style={styles.lista}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.vazioContainer}>
          <MaterialCommunityIcons name="account-multiple-outline" size={56} color={colors.textSecondary} />
          <Text style={[styles.textoVazio, { color: colors.textSecondary }]}>
            {usuarios.length === 0 ? t('screens.list.noUsers') : 'Nenhum resultado'}
          </Text>
        </View>
      )}

      <View style={styles.botoesContainer}>
        <TouchableOpacity style={[styles.botaoNovo, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Register')}>
          <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>{t('screens.list.new')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoExportar, { backgroundColor: colors.warning }]} onPress={exportarDados}>
          <MaterialCommunityIcons name="download" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>{t('screens.list.export')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoDashboard, { backgroundColor: colors.success }]} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>{t('screens.dashboard.title')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoSettings, { backgroundColor: colors.textSecondary }]} onPress={() => navigation.navigate('Settings')}>
          <MaterialCommunityIcons name="cog" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>{t('screens.settings.title')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
    titulo: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
    contador: { fontSize: 14, fontWeight: '500' },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, paddingHorizontal: 8 },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderBottomWidth: 1,
      paddingBottom: 12,
    },
    filterButton: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6, alignItems: 'center' },
    lista: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16 },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      elevation: 2,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    cardContent: { flex: 1, marginRight: 12 },
    cardNome: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    cardTexto: { fontSize: 13, marginBottom: 4, lineHeight: 18 },
    label: { fontWeight: '600' },
    editingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    editingInput: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 },
    saveButton: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    cancelButton: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    cardActions: { flexDirection: 'row', gap: 8 },
    botaoFavorito: { padding: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
    botaoBiometria: { padding: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
    botaoDeletar: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    vazioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    textoVazio: { fontSize: 16, marginTop: 12, textAlign: 'center' },
    botoesContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row', flexWrap: 'wrap' },
    botaoNovo: { flexDirection: 'row', flex: 1, minWidth: '48%', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    botaoExportar: { flexDirection: 'row', flex: 1, minWidth: '48%', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    botaoDashboard: { flexDirection: 'row', flex: 1, minWidth: '48%', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    botaoSettings: { flexDirection: 'row', flex: 1, minWidth: '48%', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    botaoTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  });
}

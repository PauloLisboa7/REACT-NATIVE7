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
import { getAllUsers, deleteUser as deleteUserFromFirestore, searchUsers } from '../services/firebaseFirestoreService';
import { verifyPassword } from '../services/firebaseAuthService';
import { UserData } from '../services/firebaseFirestoreService';

export default function ListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UserData[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [usuarioBiometria, setUsuarioBiometria] = useState<string | null>(null);

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
    // Filtrar usuários baseado na busca
    if (searchText.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const filtrados = usuarios.filter(u =>
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [searchText, usuarios]);

  const carregarDados = async () => {
    try {
      setErro(null);
      setCarregando(true);
      
      const usuariosFirebase = await getAllUsers();
      setUsuarios(usuariosFirebase);
    } catch (erro: any) {
      console.error('Erro ao carregar usuários:', erro);
      setErro('Erro ao carregar usuários. Tente novamente.');
      Alert.alert('Erro', 'Não foi possível carregar os usuários do banco de dados');
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
      // Se já é o usuário selecionado, remover
      if (usuarioBiometria === uid) {
        await AsyncStorage.removeItem('biometryUser');
        await AsyncStorage.removeItem('biometryUserId');
        await AsyncStorage.removeItem(`biometry_password_${email}`);
        setUsuarioBiometria(null);
        Alert.alert('Sucesso', 'Login por biometria desativado para este usuário');
      } else {
        // Pedir a senha para salvar
        Alert.prompt(
          'Confirmar Senha',
          'Digite sua senha para ativar biometria:',
          [
            {
              text: 'Cancelar',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Ativar',
              onPress: async (senha) => {
                if (!senha) {
                  Alert.alert('Erro', 'Senha não pode estar vazia');
                  return;
                }

                try {
                  // Verificar se a senha está correta
                  const senhaCorreta = await verifyPassword(email, senha);

                  if (!senhaCorreta) {
                    Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
                    return;
                  }

                  // Salvar credenciais
                  await AsyncStorage.setItem('biometryUser', email);
                  await AsyncStorage.setItem('biometryUserId', uid);
                  await AsyncStorage.setItem(`biometry_password_${email}`, senha);
                  setUsuarioBiometria(uid);
                  Alert.alert('Sucesso', `${email} agora pode fazer login com biometria!`);
                } catch (erro) {
                  Alert.alert('Erro', 'Não foi possível salvar as credenciais');
                  console.error(erro);
                }
              },
            },
          ],
          'secure-text'
        );
      }
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível configurar a biometria');
      console.error(erro);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const deletarUsuario = async (uid: string, email: string) => {
    Alert.prompt(
      'Confirmar Exclusão',
      'Digite sua senha para confirmar a exclusão deste usuário:',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Esqueci minha senha',
          onPress: () => {
            Alert.alert(
              'Recuperar Senha',
              'Deseja ir para a tela de recuperação de senha?',
              [
                { text: 'Não', onPress: () => {} },
                {
                  text: 'Sim',
                  onPress: () => {
                    navigation.navigate('ForgotPassword');
                  },
                },
              ]
            );
          },
          style: 'default',
        },
        {
          text: 'Deletar',
          onPress: async (senha) => {
            if (!senha) {
              Alert.alert('Erro', 'Senha não pode estar vazia');
              return;
            }

            try {
              // Verificar se a senha está correta
              const senhaCorreta = await verifyPassword(email, senha);

              if (!senhaCorreta) {
                Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
                return;
              }

              // Se a senha estiver correta, deletar o usuário
              await deleteUserFromFirestore(uid);
              setUsuarios(usuarios.filter(u => u.uid !== uid));

              // Se tinha biometria ativada, remover
              const usuarioBioSalvo = await AsyncStorage.getItem('biometryUser');
              if (usuarioBioSalvo === email) {
                await AsyncStorage.removeItem('biometryUser');
                await AsyncStorage.removeItem('biometryUserId');
                await AsyncStorage.removeItem(`biometry_password_${email}`);
              }

              Alert.alert('Sucesso', 'Usuário deletado com sucesso!');
            } catch (erro: any) {
              if (erro.code === 'auth/wrong-password') {
                Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
              } else {
                Alert.alert('Erro', erro.message || 'Erro ao deletar usuário');
              }
            }
          },
          style: 'destructive',
        },
      ],
      'secure-text'
    );
  };

  const limparTodos = async () => {
    Alert.alert(
      'Limpar todos',
      'Tem certeza que deseja deletar TODOS os cadastros?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Deletar Tudo',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('usuarios');
              setUsuarios([]);
              Alert.alert('Sucesso', 'Todos os cadastros foram deletados!');
            } catch (erro) {
              Alert.alert('Erro', 'Não foi possível limpar os dados');
              console.error(erro);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  const renderizarUsuario = ({ item }: { item: UserData }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardContent}>
        <Text style={[styles.cardNome, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
          <Text style={[styles.label, { color: colors.text }]}>Email:</Text> {item.email}
        </Text>
        <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
          <Text style={[styles.label, { color: colors.text }]}>Idade:</Text> {item.age} anos
        </Text>
        <Text style={[styles.cardTexto, { color: colors.textSecondary }]}>
          <Text style={[styles.label, { color: colors.text }]}>Cadastrado em:</Text> {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.botaoBiometria,
            usuarioBiometria === item.uid && { backgroundColor: colors.success, borderColor: colors.success }
          ]}
          onPress={() => definirUsuarioBiometria(item.uid, item.email)}
        >
          <MaterialCommunityIcons 
            name={usuarioBiometria === item.uid ? "fingerprint" : "fingerprint-off"} 
            size={20} 
            color={usuarioBiometria === item.uid ? "#fff" : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoDeletar, { backgroundColor: colors.danger }]}
          onPress={() => deletarUsuario(item.uid, item.email)}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (carregando) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando usuários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colors.text }]}>Usuários Cadastrados</Text>
        <Text style={[styles.contador, { color: colors.textSecondary }]}>{usuariosFiltrados.length} de {usuarios.length}</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar por nome ou email..."
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

      {/* Lista de Usuários */}
      {usuariosFiltrados.length > 0 ? (
        <FlatList
          data={usuariosFiltrados}
          renderItem={renderizarUsuario}
          keyExtractor={(item) => item.uid}
          style={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.vazioContainer}>
          <MaterialCommunityIcons name="account-multiple-outline" size={56} color={colors.textSecondary} />
          <Text style={[styles.textoVazio, { color: colors.textSecondary }]}>
            {usuarios.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum resultado encontrado'}
          </Text>
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botaoNovo, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => navigation.navigate('Register')}
        >
          <MaterialCommunityIcons name="account-plus" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.botaoTexto}>Novo Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoVoltar, { backgroundColor: colors.danger, shadowColor: colors.danger }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.botaoTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
    },
    titulo: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    contador: {
      fontSize: 14,
      fontWeight: '500',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
    },
    lista: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    cardContent: {
      flex: 1,
      marginRight: 12,
    },
    cardNome: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    cardTexto: {
      fontSize: 13,
      marginBottom: 4,
      lineHeight: 18,
    },
    label: {
      fontWeight: '600',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    botaoBiometria: {
      padding: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    botaoDeletar: {
      padding: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    vazioContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    textoVazio: {
      fontSize: 16,
      marginTop: 12,
      textAlign: 'center',
    },
    botoesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    botaoNovo: {
      flexDirection: 'row',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    botaoVoltar: {
      flexDirection: 'row',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonIcon: {
      marginRight: 8,
    },
    botaoTexto: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}

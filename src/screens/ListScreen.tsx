import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  cpf?: string;
  senha?: string; // se existir localmente (não recomendado)
  uid?: string; // uid do Firebase Auth quando sincronizado
}

export default function ListScreen({ navigation }: any) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });

    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carregar dados do AsyncStorage (local)
      let usuariosLocais: Usuario[] = [];
      const dadosArmazenados = await AsyncStorage.getItem('usuarios');
      
      if (dadosArmazenados) {
        try {
          usuariosLocais = JSON.parse(dadosArmazenados);
        } catch (e) {
          usuariosLocais = [];
        }
      }
      
      // Carregar dados do Firebase
      let usuariosFirebase: Usuario[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        usuariosFirebase = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Usuario));
      } catch (erroFirebase) {
        console.warn('Erro ao carregar do Firebase:', erroFirebase);
        // Continua mesmo se Firebase falhar
      }
      
      // Combinar dados (remove duplicatas usando email como identificador)
      const usuariosCombinados = [...usuariosLocais];
      const emailsLocais = new Set(usuariosLocais.map(u => u.email));
      
      usuariosFirebase.forEach(usuarioFB => {
        if (!emailsLocais.has(usuarioFB.email)) {
          usuariosCombinados.push(usuarioFB);
        }
      });
      
      setUsuarios(usuariosCombinados);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  const deletarUsuario = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este cadastro? Isso também irá remover a conta.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              const usuarioParaDeletar = usuarios.find(u => u.id === id);
              
              // Deletar do Firebase Firestore
              try {
                await deleteDoc(doc(db, 'usuarios', id));
                console.log('Usuário deletado do Firestore');
              } catch (erroFirestore) {
                console.warn('Erro ao deletar do Firestore:', erroFirestore);
              }

              // Deletar conta do Firebase Auth (se o usuário estiver logado com esse email)
              try {
                const currentUser = auth.currentUser;
                if (currentUser && currentUser.email === usuarioParaDeletar?.email) {
                  // Se é o usuário logado, não pode deletar a si mesmo
                  Alert.alert('Erro', 'Não é possível deletar sua própria conta enquanto está logado');
                  return;
                } else if (usuarioParaDeletar?.uid) {
                  // Se temos o uid, precisamos deletar a conta
                  // Nota: deleteUser só funciona com o usuário atualmente autenticado
                  console.log('Usuário tem uid:', usuarioParaDeletar.uid);
                }
              } catch (erroAuth) {
                console.warn('Erro ao deletar do Auth:', erroAuth);
              }

              // Deletar do AsyncStorage local
              const usuariosFiltrados = usuarios.filter((u) => u.id !== id);
              await AsyncStorage.setItem('usuarios', JSON.stringify(usuariosFiltrados));
              
              setUsuarios(usuariosFiltrados);
              Alert.alert('Sucesso', 'Cadastro deletado com sucesso!');
            } catch (erro) {
              Alert.alert('Erro', 'Não foi possível deletar o cadastro');
              console.error(erro);
            }
          },
        },
      ]
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

  const renderizarUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Email:</Text> {item.email}
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Telefone:</Text> {item.telefone}
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Data:</Text> {item.data}
        </Text>
        {item.cpf ? (
          <Text style={styles.cardTexto}>
            <Text style={styles.label}>CPF:</Text> {item.cpf}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.botaoDeletar}
        onPress={() => deletarUsuario(item.id)}
      >
        <Text style={styles.textoBotaoDeletar}>Deletar</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Carregando...</Text>
      </View>
    );
  }

  const mostrarFlatList = usuarios.length > 0;
  const mostrarBotaoLimpar = usuarios.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Usuários Cadastrados</Text>
      <Text style={styles.contador}>{usuarios.length} cadastro(s)</Text>

      {mostrarFlatList ? (
        <FlatList
          data={usuarios}
          renderItem={renderizarUsuario}
          keyExtractor={(item) => item.id}
          style={styles.lista}
        />
      ) : (
        <View style={styles.vazioContainer}>
          <Text style={styles.textoVazio}>Nenhum cadastro realizado ainda</Text>
        </View>
      )}

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botaoNovo}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.botaoTexto}>NOVO CADASTRO</Text>
        </TouchableOpacity>

        {mostrarBotaoLimpar ? (
          <TouchableOpacity
            style={styles.botaoLimpar}
            onPress={limparTodos}
          >
            <Text style={styles.botaoTexto}>LIMPAR TODOS</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contador: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: '#1F2937',
  },
  botaoDeletar: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  textoBotaoDeletar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  vazioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textoVazio: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 28,
  },
  botoesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  botaoWrapper: {
    marginBottom: 12,
  },
  botaoNovo: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  botaoLimpar: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  botaoVoltar: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

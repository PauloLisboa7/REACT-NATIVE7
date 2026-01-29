import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
    });

    return unsubscribe;
  }, [navigation]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dadosArmazenados = await AsyncStorage.getItem('usuarios');
      
      if (dadosArmazenados) {
        try {
          const usuariosParseados: Usuario[] = JSON.parse(dadosArmazenados);
          setUsuarios(usuariosParseados);
        } catch (e) {
          setUsuarios([]);
        }
      } else {
        setUsuarios([]);
      }
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
      'Tem certeza que deseja deletar este cadastro?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
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
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  contador: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  botaoDeletar: {
    backgroundColor: '#f44336',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textoBotaoDeletar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  vazioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVazio: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
  },
  botoesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 16,
    paddingBottom: 20,
  },
  botaoWrapper: {
    marginBottom: 12,
  },
  botaoNovo: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoLimpar: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoVoltar: {
    backgroundColor: '#757575',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

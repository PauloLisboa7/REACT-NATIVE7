import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');

  const [nomeError, setNomeError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [telefoneError, setTelefoneError] = useState(false);
  const [cpfError, setCpfError] = useState(false);
  const [senhaError, setSenhaError] = useState(false);

  const validarEmail = (email: string) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  };

  const validarTelefone = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const validarCpf = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const validarSenha = (senha: string) => {
    return senha.length >= 6;
  };

  const validarNome = (nome: string) => {
    return nome.trim().length >= 3;
  };

  const validarFormulario = () => {
    let temErro = false;

    if (!validarNome(nome)) {
      setNomeError(true);
      temErro = true;
    } else {
      setNomeError(false);
    }

    if (!validarEmail(email)) {
      setEmailError(true);
      temErro = true;
    } else {
      setEmailError(false);
    }

    if (!validarTelefone(telefone)) {
      setTelefoneError(true);
      temErro = true;
    } else {
      setTelefoneError(false);
    }

    if (!validarCpf(cpf)) {
      setCpfError(true);
      temErro = true;
    } else {
      setCpfError(false);
    }

    if (!validarSenha(senha)) {
      setSenhaError(true);
      temErro = true;
    } else {
      setSenhaError(false);
    }

    return !temErro;
  };

  const salvarDados = async () => {
    if (!validarFormulario()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const createdUser = userCredential.user;

      const novoUsuario = {
        id: createdUser.uid,
        nome: nome,
        email: email,
        telefone: telefone,
        cpf: cpf,
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
      };

      // Salvar no AsyncStorage (local) sem senha
      const dados = await AsyncStorage.getItem('usuarios');
      let usuarios: any = [];

      if (dados) {
        try {
          usuarios = JSON.parse(dados);
          if (!Array.isArray(usuarios)) {
            usuarios = [];
          }
        } catch (e) {
          usuarios = [];
        }
      }

      usuarios.push(novoUsuario);
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Salvar no Firebase Firestore (coleção 'usuarios') sem a senha
      try {
        await addDoc(collection(db, 'usuarios'), {
          uid: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          telefone: novoUsuario.telefone,
          cpf: novoUsuario.cpf,
          dataCriacao: novoUsuario.dataCriacao,
          timestamp: serverTimestamp(),
        });
      } catch (firebaseError) {
        console.warn('Erro ao salvar no Firebase:', firebaseError);
        Alert.alert('Aviso', 'Usuário criado em Auth, mas falhou ao salvar no Firestore. Verifique sua conexão.');
      }

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

      setNome('');
      setEmail('');
      setTelefone('');
      setCpf('');
      setSenha('');
      setNomeError(false);
      setEmailError(false);
      setTelefoneError(false);
      setCpfError(false);
      setSenhaError(false);

      navigation.navigate('List');
    } catch (erro: any) {
      console.error('Erro ao salvar:', erro);
      let msg = 'Erro ao cadastrar usuário';
      if (erro && erro.code) {
        switch (erro.code) {
          case 'auth/email-already-in-use':
            msg = 'Email já está em uso';
            break;
          case 'auth/invalid-email':
            msg = 'Email inválido';
            break;
          case 'auth/weak-password':
            msg = 'Senha muito fraca (mínimo 6 caracteres)';
            break;
          default:
            msg = erro.message || msg;
        }
      }
      Alert.alert('Erro', msg);
    }
  };

  const formatarTelefone = (texto: string) => {
    const apenasNumeros = texto.replace(/\D/g, '');
    
    if (apenasNumeros.length === 0) return '';
    if (apenasNumeros.length <= 2) return `(${apenasNumeros}`;
    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  const formatarCpf = (texto: string) => {
    const apenasNumeros = texto.replace(/\D/g, '').slice(0, 11);
    if (apenasNumeros.length === 0) return '';
    if (apenasNumeros.length <= 3) return apenasNumeros;
    if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0,3)}.${apenasNumeros.slice(3)}`;
    if (apenasNumeros.length <= 9) return `${apenasNumeros.slice(0,3)}.${apenasNumeros.slice(3,6)}.${apenasNumeros.slice(6)}`;
    return `${apenasNumeros.slice(0,3)}.${apenasNumeros.slice(3,6)}.${apenasNumeros.slice(6,9)}-${apenasNumeros.slice(9,11)}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Usuários</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nome</Text>
        {nomeError ? <TextInput
          style={styles.inputError}
          placeholder="Digite seu nome completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={(texto) => {
            setNome(texto);
            setNomeError(false);
          }}
        /> : <TextInput
          style={styles.input}
          placeholder="Digite seu nome completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={(texto) => {
            setNome(texto);
            setNomeError(false);
          }}
        />}
        {nomeError ? <Text style={styles.textoErro}>Nome deve ter no mínimo 3 caracteres</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        {emailError ? <TextInput
          style={styles.inputError}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            setEmailError(false);
          }}
        /> : <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            setEmailError(false);
          }}
        />}
        {emailError ? <Text style={styles.textoErro}>Email inválido</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>CPF</Text>
        {cpfError ? <TextInput
          style={styles.inputError}
          placeholder="000.000.000-00"
          placeholderTextColor="#999"
          value={cpf}
          onChangeText={(texto) => {
            setCpf(formatarCpf(texto));
            setCpfError(false);
          }}
        /> : <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#999"
          value={cpf}
          onChangeText={(texto) => {
            setCpf(formatarCpf(texto));
            setCpfError(false);
          }}
        />}
        {cpfError ? <Text style={styles.textoErro}>CPF deve conter 11 dígitos</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Senha</Text>
        {senhaError ? <TextInput
          style={styles.inputError}
          placeholder="Digite uma senha (mín. 6 caracteres)"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={(texto) => {
            setSenha(texto);
            setSenhaError(false);
          }}
        /> : <TextInput
          style={styles.input}
          placeholder="Digite uma senha (mín. 6 caracteres)"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={(texto) => {
            setSenha(texto);
            setSenhaError(false);
          }}
        />}
        {senhaError ? <Text style={styles.textoErro}>Senha deve ter no mínimo 6 caracteres</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Telefone</Text>
        {telefoneError ? <TextInput
          style={styles.inputError}
          placeholder="(XX) XXXXX-XXXX"
          placeholderTextColor="#999"
          value={telefone}
          onChangeText={(texto) => {
            setTelefone(formatarTelefone(texto));
            setTelefoneError(false);
          }}
        /> : <TextInput
          style={styles.input}
          placeholder="(XX) XXXXX-XXXX"
          placeholderTextColor="#999"
          value={telefone}
          onChangeText={(texto) => {
            setTelefone(formatarTelefone(texto));
            setTelefoneError(false);
          }}
        />}
        {telefoneError ? <Text style={styles.textoErro}>Telefone deve conter 11 dígitos</Text> : null}
      </View>

      <View style={styles.botoesContainer}>
        <TouchableOpacity 
          style={styles.botaoSalvar}
          onPress={salvarDados}
        >
          <Text style={styles.botaoTexto}>SALVAR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botaoLista}
          onPress={() => navigation.navigate('List')}
        >
          <Text style={styles.botaoTexto}>VER CADASTRADOS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textoErro: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
  },
  botoesContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoLista: {
    backgroundColor: '#2196F3',
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

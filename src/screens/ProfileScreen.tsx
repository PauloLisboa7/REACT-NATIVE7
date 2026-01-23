import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');

  useEffect(() => {
    console.log('ProfileScreen montada - Tela de Cadastro aberta');
    return () => {
      console.log('ProfileScreen desmontada');
    };
  }, []);

  const handleSalvar = () => {
    if (!nome || !email || !idade) {
      Alert.alert('Aviso', 'Preencha todos os campos!');
      return;
    }
    console.log('Cadastro salvo:', { nome, email, idade });
    Alert.alert('Sucesso', `Usuário ${nome} cadastrado com sucesso!`);
    setNome('');
    setEmail('');
    setIdade('');
  };

  const handleVoltar = () => {
    navigation.goBack?.();
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro de Usuário</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#bbb"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua idade"
              value={idade}
              onChangeText={setIdade}
              placeholderTextColor="#bbb"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.buttonSalvar} onPress={handleSalvar}>
            <Text style={styles.buttonText}>SALVAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonVoltar} onPress={handleVoltar}>
            <Text style={styles.buttonVoltarText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  buttonSalvar: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonVoltar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonVoltarText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
